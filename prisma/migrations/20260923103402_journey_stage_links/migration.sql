/*
  Warnings:

  - You are about to drop the column `personaId` on the `journey_maps` table. All the data in the column will be lost.
  - You are about to drop the column `findingId` on the `journey_stages` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_FindingToJourneyStage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FindingToJourneyStage_A_fkey" FOREIGN KEY ("A") REFERENCES "findings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FindingToJourneyStage_B_fkey" FOREIGN KEY ("B") REFERENCES "journey_stages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_JourneyStageToPersona" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_JourneyStageToPersona_A_fkey" FOREIGN KEY ("A") REFERENCES "journey_stages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_JourneyStageToPersona_B_fkey" FOREIGN KEY ("B") REFERENCES "personas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_journey_maps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "journey_maps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_journey_maps" ("createdAt", "description", "id", "projectId", "title", "updatedAt") SELECT "createdAt", "description", "id", "projectId", "title", "updatedAt" FROM "journey_maps";
DROP TABLE "journey_maps";
ALTER TABLE "new_journey_maps" RENAME TO "journey_maps";
CREATE INDEX "journey_maps_projectId_idx" ON "journey_maps"("projectId");
CREATE TABLE "new_journey_stages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journeyMapId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "painType" TEXT,
    "frictionRating" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "journey_stages_journeyMapId_fkey" FOREIGN KEY ("journeyMapId") REFERENCES "journey_maps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_journey_stages" ("createdAt", "description", "id", "journeyMapId", "name", "painType", "position", "updatedAt") SELECT "createdAt", "description", "id", "journeyMapId", "name", "painType", "position", "updatedAt" FROM "journey_stages";
DROP TABLE "journey_stages";
ALTER TABLE "new_journey_stages" RENAME TO "journey_stages";
CREATE UNIQUE INDEX "journey_stages_journeyMapId_position_key" ON "journey_stages"("journeyMapId", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_FindingToJourneyStage_AB_unique" ON "_FindingToJourneyStage"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingToJourneyStage_B_index" ON "_FindingToJourneyStage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JourneyStageToPersona_AB_unique" ON "_JourneyStageToPersona"("A", "B");

-- CreateIndex
CREATE INDEX "_JourneyStageToPersona_B_index" ON "_JourneyStageToPersona"("B");
