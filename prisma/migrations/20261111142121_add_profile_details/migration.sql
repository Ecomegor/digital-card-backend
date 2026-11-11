-- CreateTable
CREATE TABLE "profile_links" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "profile_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_links_profile_id_label_key" ON "profile_links"("profile_id", "label");

-- CreateIndex
CREATE UNIQUE INDEX "profile_links_profile_id_sort_order_key" ON "profile_links"("profile_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "skills_profile_id_name_key" ON "skills"("profile_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_profile_id_sort_order_key" ON "skills"("profile_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "experiences_profile_id_sort_order_key" ON "experiences"("profile_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "projects_profile_id_name_key" ON "projects"("profile_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "projects_profile_id_sort_order_key" ON "projects"("profile_id", "sort_order");

-- AddForeignKey
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_period_check" CHECK ("end_date" IS NULL OR "end_date" >= "start_date");

-- AddCheckConstraint
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_sort_order_check" CHECK ("sort_order" >= 0);

-- AddCheckConstraint
ALTER TABLE "skills" ADD CONSTRAINT "skills_sort_order_check" CHECK ("sort_order" >= 0);

-- AddCheckConstraint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_sort_order_check" CHECK ("sort_order" >= 0);

-- AddCheckConstraint
ALTER TABLE "projects" ADD CONSTRAINT "projects_sort_order_check" CHECK ("sort_order" >= 0);
