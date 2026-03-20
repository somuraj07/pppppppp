import prisma from "@/lib/db";

type SessionUserLike = {
  id?: string | null;
  schoolId?: string | null;
};

export async function resolveSchoolIdForSessionUser(user: SessionUserLike) {
  if (!user?.id) {
    return null;
  }

  if (user.schoolId) {
    return user.schoolId;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      schoolId: true,
      student: { select: { schoolId: true } },
      adminSchools: { select: { id: true } },
      teacherSchools: { select: { id: true } },
    },
  });

  const schoolId =
    dbUser?.schoolId ??
    dbUser?.student?.schoolId ??
    dbUser?.adminSchools?.[0]?.id ??
    dbUser?.teacherSchools?.[0]?.id ??
    null;

  if (!schoolId) {
    return null;
  }

  if (!dbUser?.schoolId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { schoolId },
    });
  }

  return schoolId;
}
