"""
Unit Tests for Ticket T-01: Shared API Contract, Schemas & Mock Fixtures.
Validates Pydantic domain models, enums, JSON schema compliance, and fixture integrity.
"""

import json
import os
import pytest
from pathlib import Path

from shared.schema import (
    DEFAULT_HOUSEHOLD_ID,
    DEFAULT_PAYER_ID,
    SplitRuleType,
    ExpenseCategory,
    EscalationStage,
    SharePaymentStatus,
    HabitBadge,
    ActivityEventType,
    Roommate,
    Household,
    ExpenseItem,
    ParsedExpense,
    SplitShare,
    Expense,
    PaymentIntent,
    RawDebt,
    Settlement,
    ConfirmPaymentResponse,
    ConfirmSettlementRequest,
    DebtSimplificationResult,
    AgentActivityLog,
    HabitProfile,
)


class TestSharedContractsAndFixtures:
    """Acceptance criteria validation for Ticket T-01."""

    @pytest.fixture
    def shared_dir(self) -> Path:
        return Path(__file__).resolve().parent.parent.parent / "shared"

    def test_household_seed_fixture_loading(self, shared_dir: Path):
        """Validates that shared/mock_data/household_seed.json loads and matches the Household Pydantic schema."""
        seed_path = shared_dir / "mock_data" / "household_seed.json"
        assert seed_path.exists(), f"Household seed fixture missing at {seed_path}"

        with open(seed_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        household = Household.model_validate(data)
        assert household.id == DEFAULT_HOUSEHOLD_ID
        assert len(household.roommates) == 4
        assert household.default_currency == "INR"
        assert household.default_split_rule == SplitRuleType.EQUAL

        # Verify roommates
        roommate_ids = [rm.id for rm in household.roommates]
        assert DEFAULT_PAYER_ID in roommate_ids
        for rm in household.roommates:
            assert rm.upi_vpa.strip() != ""
            assert rm.room_sq_ft > 0
            assert rm.habit_badge in list(HabitBadge)

    def test_sample_bills_fixture_loading(self, shared_dir: Path):
        """Validates that shared/mock_data/sample_bills.json loads and matches ParsedExpense schema."""
        bills_path = shared_dir / "mock_data" / "sample_bills.json"
        assert bills_path.exists(), f"Sample bills fixture missing at {bills_path}"

        with open(bills_path, "r", encoding="utf-8") as f:
            bills_data = json.load(f)

        assert isinstance(bills_data, list)
        assert len(bills_data) >= 4

        for item in bills_data:
            parsed = ParsedExpense.model_validate(item)
            assert parsed.vendor != ""
            assert parsed.total_amount > 0
            assert parsed.category in list(ExpenseCategory)
            assert parsed.confidence_score >= 0.0
            assert len(parsed.items) > 0

    def test_all_pydantic_domain_models_instantiation(self):
        """Tests that all core domain models instantiate with strict validation."""
        # Roommate & Household
        rm = Roommate(
            id="rm_test",
            name="Test User",
            email="test@example.com",
            phone="+919876543210",
            upi_vpa="test@upi",
            room_sq_ft=300.0,
            habit_badge=HabitBadge.RAPID_SETTLER,
            avg_settlement_hours=1.5,
        )
        hh = Household(
            id="hh_test",
            name="Test Villa",
            roommates=[rm],
        )
        assert hh.roommates[0].name == "Test User"

        # Expense Items & Expense
        item = ExpenseItem(name="Item 1", amount=100.0, category="GROCERY", assigned_roommate_ids=["rm_test"])
        expense = Expense(
            id="exp_01",
            household_id="hh_test",
            payer_id="rm_test",
            payer_name="Test User",
            vendor="Supermarket",
            category=ExpenseCategory.GROCERIES,
            total_amount=100.0,
            bill_date="2026-08-29",
            due_date="2026-09-05",
            split_rule=SplitRuleType.ITEMIZED,
            items=[item],
            shares=[
                SplitShare(
                    id="share_01",
                    expense_id="exp_01",
                    roommate_id="rm_test",
                    roommate_name="Test User",
                    amount_owed=100.0,
                    status=SharePaymentStatus.UNPAID,
                    escalation_stage=EscalationStage.STAGE_1_ANNOUNCE,
                )
            ],
        )
        assert expense.shares[0].amount_owed == 100.0

        # PaymentIntent
        pi = PaymentIntent(
            payee_vpa="test@upi",
            payee_name="Test User",
            amount=100.0,
            transaction_note="Settlement",
            deep_link="upi://pay?pa=test@upi&pn=Test%20User&am=100.00&cu=INR",
            qr_code_base64="data:image/png;base64,...",
        )
        assert pi.amount == 100.0

        # RawDebt & Settlement
        debt = RawDebt(
            debtor_id="rm_1",
            debtor_name="Debtor",
            creditor_id="rm_2",
            creditor_name="Creditor",
            amount=500.0,
        )
        settlement = Settlement(
            from_roommate_id="rm_1",
            from_roommate_name="Debtor",
            to_roommate_id="rm_2",
            to_roommate_name="Creditor",
            amount=500.0,
        )
        assert debt.amount == settlement.amount

        # DebtSimplificationResult
        res = DebtSimplificationResult(
            raw_debts_count=3,
            simplified_transfers_count=1,
            total_volume_cleared=500.0,
            settlements=[settlement],
        )
        assert res.simplified_transfers_count == 1

        # Activity Log & Habit Profile
        log = AgentActivityLog(
            id="log_01",
            household_id="hh_test",
            timestamp="2026-08-29T00:00:00Z",
            event_type=ActivityEventType.SPLIT_CALCULATED,
            title="Split calculated",
            description="Equal split applied",
        )
        assert log.event_type == ActivityEventType.SPLIT_CALCULATED

        habit = HabitProfile(
            roommate_id="rm_test",
            roommate_name="Test User",
            avg_settlement_hours=5.0,
            on_time_ratio=1.0,
            total_bills_settled=10,
            consecutive_late_count=0,
            habit_badge=HabitBadge.RAPID_SETTLER,
        )
        assert habit.habit_badge == HabitBadge.RAPID_SETTLER

        # Confirm responses
        resp = ConfirmPaymentResponse(status="success", split_share=expense.shares[0])
        assert resp.status == "success"

        req = ConfirmSettlementRequest(
            household_id="hh_test",
            from_roommate_id="rm_1",
            to_roommate_id="rm_2",
            amount=500.0,
        )
        assert req.amount == 500.0

    def test_auth_and_user_models_instantiation(self):
        """Validates Ticket T-15 User and Auth models."""
        from shared.schema import (
            User,
            AuthToken,
            UserRegisterRequest,
            UserLoginRequest,
            UserProfileUpdateRequest,
        )

        user = User(
            id="usr_123",
            name="Alex Chen",
            email="alex@example.com",
            phone="+919876543210",
            upi_vpa="alex@okaxis",
            household_ids=["hh_palm_grove_402"],
            created_at="2026-08-29T10:00:00Z",
        )
        assert user.name == "Alex Chen"
        assert len(user.household_ids) == 1

        token = AuthToken(
            access_token="test_jwt_token_xyz",
            token_type="bearer",
            user=user,
        )
        assert token.access_token == "test_jwt_token_xyz"
        assert token.user.email == "alex@example.com"

        reg = UserRegisterRequest(
            name="New User",
            email="new@example.com",
            password="secretpassword",
            phone="+919999999999",
            upi_vpa="new@upi",
        )
        assert reg.password == "secretpassword"

        login = UserLoginRequest(
            email="new@example.com",
            password="secretpassword",
        )
        assert login.email == "new@example.com"

        update = UserProfileUpdateRequest(
            name="Updated Name",
            upi_vpa="updated@upi",
        )
        assert update.name == "Updated Name"
        assert update.phone is None

    def test_household_management_and_settlement_models(self):
        """Validates Ticket T-15 Household requests and Settlement status matrix schemas."""
        from shared.schema import (
            CreateHouseholdRequest,
            AddMemberRequest,
            UpdateMemberRequest,
            MemberPaymentSummary,
            BillShareStatusSummary,
            HouseholdSettlementStatus,
            EscalationStage,
            ExpenseCategory,
            SplitRuleType,
        )

        create_hh = CreateHouseholdRequest(
            name="New Horizon Flat 101",
            default_currency="INR",
            default_split_rule=SplitRuleType.ROOM_AREA,
            creator_user_id="usr_123",
        )
        assert create_hh.name == "New Horizon Flat 101"
        assert create_hh.default_split_rule == SplitRuleType.ROOM_AREA

        add_mem = AddMemberRequest(
            name="Siddharth",
            email="sid@example.com",
            upi_vpa="sid@okhdfc",
            room_sq_ft=320.0,
        )
        assert add_mem.room_sq_ft == 320.0

        update_mem = UpdateMemberRequest(
            room_sq_ft=350.0,
            custom_split_pct=30.0,
        )
        assert update_mem.room_sq_ft == 350.0

        mem_summary = MemberPaymentSummary(
            roommate_id="rm_alex",
            roommate_name="Alex Chen",
            total_owed=1500.0,
            total_paid=1500.0,
            total_pending=0.0,
            is_cleared=True,
            upi_vpa="alex@okaxis",
            pending_shares_count=0,
            highest_escalation_stage=None,
        )
        assert mem_summary.is_cleared is True

        pending_mem = MemberPaymentSummary(
            roommate_id="rm_rahul",
            roommate_name="Rahul Verma",
            total_owed=1200.0,
            total_paid=0.0,
            total_pending=1200.0,
            is_cleared=False,
            upi_vpa="rahul@ybl",
            pending_shares_count=2,
            highest_escalation_stage=EscalationStage.STAGE_3_DEADLINE,
        )
        assert pending_mem.total_pending == 1200.0
        assert pending_mem.highest_escalation_stage == EscalationStage.STAGE_3_DEADLINE

        bill_summary = BillShareStatusSummary(
            expense_id="exp_01",
            vendor="Power Corp",
            category=ExpenseCategory.ELECTRICITY,
            total_amount=2400.0,
            due_date="2026-09-01",
            payer_id="rm_alex",
            payer_name="Alex Chen",
            paid_count=2,
            unpaid_count=2,
            is_fully_settled=False,
            shares=[],
        )
        assert bill_summary.paid_count == 2
        assert bill_summary.is_fully_settled is False

        status = HouseholdSettlementStatus(
            household_id="hh_palm_grove_402",
            total_billed=2400.0,
            total_paid=1200.0,
            total_pending=1200.0,
            cleared_percentage=50.0,
            paid_members=[mem_summary],
            pending_members=[pending_mem],
            bills_summary=[bill_summary],
        )
        assert status.cleared_percentage == 50.0
        assert len(status.paid_members) == 1
        assert len(status.pending_members) == 1

