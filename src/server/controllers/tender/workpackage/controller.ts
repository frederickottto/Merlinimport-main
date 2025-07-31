import { db as prisma } from "@/server/db/prisma.server";
import { type CreateWorkpackage, type UpdateWorkpackage } from "./schema";

export const createWorkpackage = async (data: CreateWorkpackage) => {
  return prisma.workpackage.create({
    data,
  });
};

export const updateWorkpackage = async (data: UpdateWorkpackage) => {
  const { id, ...updateData } = data;
  return prisma.workpackage.update({
    where: { id },
    data: updateData,
  });
};

export const deleteWorkpackage = async (id: string) => {
  return prisma.workpackage.delete({
    where: { id },
  });
};

export const getWorkpackage = async (id: string) => {
  return prisma.workpackage.findUnique({
    where: { id },
  });
};

export const getWorkpackagesByLot = async (lotId: string) => {
  return prisma.workpackage.findMany({
    where: { lotID: lotId },
  });
}; 