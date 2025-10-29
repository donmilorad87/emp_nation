-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "usedPasswords" TEXT[],
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "emailUpdated" TEXT,
    "emailList" TEXT[],
    "usernameList" TEXT[],
    "role" INTEGER NOT NULL DEFAULT 0,
    "twofactorauth" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "room_url" TEXT,
    "room_name" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL DEFAULT '',
    "regular_provider" BOOLEAN NOT NULL DEFAULT false,
    "aichat" BOOLEAN NOT NULL DEFAULT false,
    "transcript" BOOLEAN NOT NULL DEFAULT false,
    "logo" TEXT NOT NULL DEFAULT 'en',
    "top_header" BOOLEAN NOT NULL DEFAULT false,
    "auto_join" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT NOT NULL,
    "room_url_client" TEXT,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresistedMessages" (
    "id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "duration_in_sec" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "callclient_id" TEXT NOT NULL,
    "message" TEXT,
    "room_id_foreign_key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresistedMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threadsMessages" (
    "id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "threadIdentifier" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "threadsMessages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Token_code_key" ON "Token"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Room_room_name_key" ON "Room"("room_name");

-- CreateIndex
CREATE UNIQUE INDEX "threadsMessages_room_name_key" ON "threadsMessages"("room_name");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresistedMessages" ADD CONSTRAINT "PresistedMessages_room_id_foreign_key_fkey" FOREIGN KEY ("room_id_foreign_key") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
