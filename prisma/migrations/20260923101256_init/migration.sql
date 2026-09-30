-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "candidateRole" TEXT,
    "candidateCompany" TEXT,
    "age" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "investingBehavior" TEXT,
    "goals" TEXT,
    "frustrations" TEXT,
    "notesText" TEXT NOT NULL,
    "dateConducted" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "interviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "ageRange" TEXT,
    "occupation" TEXT,
    "goals" TEXT NOT NULL,
    "frustrations" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "personas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "persona_interviews" (
    "personaId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,

    PRIMARY KEY ("personaId", "interviewId"),
    CONSTRAINT "persona_interviews_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "persona_interviews_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "findings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "interviewId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "findings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "findings_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recommendations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recommendations_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journey_maps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "personaId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "journey_maps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "journey_maps_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journey_stages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journeyMapId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "painType" TEXT,
    "findingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "journey_stages_journeyMapId_fkey" FOREIGN KEY ("journeyMapId") REFERENCES "journey_maps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "journey_stages_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "interviews_projectId_dateConducted_idx" ON "interviews"("projectId", "dateConducted");

-- CreateIndex
CREATE INDEX "personas_projectId_idx" ON "personas"("projectId");

-- CreateIndex
CREATE INDEX "persona_interviews_interviewId_idx" ON "persona_interviews"("interviewId");

-- CreateIndex
CREATE INDEX "findings_projectId_category_idx" ON "findings"("projectId", "category");

-- CreateIndex
CREATE INDEX "findings_projectId_severity_idx" ON "findings"("projectId", "severity");

-- CreateIndex
CREATE INDEX "findings_interviewId_idx" ON "findings"("interviewId");

-- CreateIndex
CREATE INDEX "recommendations_projectId_status_idx" ON "recommendations"("projectId", "status");

-- CreateIndex
CREATE INDEX "recommendations_findingId_idx" ON "recommendations"("findingId");

-- CreateIndex
CREATE INDEX "journey_maps_projectId_idx" ON "journey_maps"("projectId");

-- CreateIndex
CREATE INDEX "journey_maps_personaId_idx" ON "journey_maps"("personaId");

-- CreateIndex
CREATE INDEX "journey_stages_findingId_idx" ON "journey_stages"("findingId");

-- CreateIndex
CREATE UNIQUE INDEX "journey_stages_journeyMapId_position_key" ON "journey_stages"("journeyMapId", "position");
