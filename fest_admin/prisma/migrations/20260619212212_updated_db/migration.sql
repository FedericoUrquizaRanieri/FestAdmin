-- CreateEnum
CREATE TYPE "ConversarionControl" AS ENUM ('AI', 'HUMAN');

-- CreateEnum
CREATE TYPE "ConversationState" AS ENUM ('IDLE', 'WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GenderStruct" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PurchaseState" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TransferState" AS ENUM ('UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone_number" TEXT NOT NULL DEFAULT '',
    "buffer" TEXT DEFAULT '',
    "summary" TEXT DEFAULT '',
    "state" "ConversationState",
    "last_message" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "pending" BOOLEAN,
    "control_over" "ConversarionControl",

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE,
    "name" TEXT DEFAULT '',
    "location" TEXT DEFAULT '',
    "ticket_price" BIGINT DEFAULT 10000,
    "transfer_link" TEXT DEFAULT 'reptil.yuyo.medano',

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" UUID NOT NULL,
    "description" TEXT,
    "amount" BIGINT,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "conversation_id" UUID,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyer_phone" TEXT DEFAULT '',
    "total_amount" BIGINT,
    "paid_amount" BIGINT,
    "state" "PurchaseState",
    "conversation_id" UUID,
    "event_id" UUID,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_name" TEXT,
    "last_name" TEXT,
    "number_assoc" TEXT,
    "payment_state" BOOLEAN,
    "gender" "GenderStruct",
    "price" BIGINT,
    "checked_in" TIMESTAMPTZ(6),
    "purchase_id" UUID,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_auth" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone_number" TEXT DEFAULT '',
    "storage_path" TEXT DEFAULT '',
    "state" "TransferState",
    "purchase_id" UUID,

    CONSTRAINT "transfer_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversations_state_idx" ON "conversations"("state");

-- CreateIndex
CREATE INDEX "conversations_control_over_idx" ON "conversations"("control_over");

-- CreateIndex
CREATE INDEX "conversations_pending_idx" ON "conversations"("pending");

-- CreateIndex
CREATE INDEX "expenses_event_id_idx" ON "expenses"("event_id");

-- CreateIndex
CREATE INDEX "purchases_conversation_id_idx" ON "purchases"("conversation_id");

-- CreateIndex
CREATE INDEX "purchases_event_id_idx" ON "purchases"("event_id");

-- CreateIndex
CREATE INDEX "purchases_state_idx" ON "purchases"("state");

-- CreateIndex
CREATE INDEX "tickets_purchase_id_idx" ON "tickets"("purchase_id");

-- CreateIndex
CREATE INDEX "tickets_gender_idx" ON "tickets"("gender");

-- CreateIndex
CREATE INDEX "tickets_payment_state_idx" ON "tickets"("payment_state");

-- CreateIndex
CREATE INDEX "transfer_auth_purchase_id_idx" ON "transfer_auth"("purchase_id");

-- CreateIndex
CREATE INDEX "transfer_auth_state_idx" ON "transfer_auth"("state");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_auth" ADD CONSTRAINT "transfer_auth_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
