-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "prefectureId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalScore" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scoreType" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalScoreHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scoreType" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPractice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "practiceType" INTEGER NOT NULL,
    "practice" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPractice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPracticeAnswerHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "answer" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPracticeAnswerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalScore_userId_scoreType_key" ON "ExternalScore"("userId", "scoreType");

-- AddForeignKey
ALTER TABLE "ExternalScore" ADD CONSTRAINT "ExternalScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalScoreHistory" ADD CONSTRAINT "ExternalScoreHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPractice" ADD CONSTRAINT "UserPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeAnswerHistory" ADD CONSTRAINT "UserPracticeAnswerHistory_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "UserPractice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
