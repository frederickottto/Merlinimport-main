import { db as prisma } from "@/server/db/prisma.server";
import { type CreateLot, type UpdateLot } from "./schema";

export const createLot = async (data: CreateLot) => {
  return prisma.lot.create({
    data,
  });
};

export const updateLot = async (data: UpdateLot) => {
  const { id, ...updateData } = data;
  return prisma.lot.update({
    where: { id },
    data: updateData,
  });
};

export const deleteLot = async (id: string) => {
  // First delete all workpackages associated with this lot
  await prisma.workpackage.deleteMany({
    where: { lotID: id },
  });

  // Then delete all child lots
  await prisma.lot.deleteMany({
    where: { parentLotID: id },
  });

  // Finally delete the lot itself
  return prisma.lot.delete({
    where: { id },
  });
};

export const getLot = async (id: string) => {
  return prisma.lot.findUnique({
    where: { id },
    include: {
      childLots: true,
      workpackages: true,
    },
  });
};

export const getLotsByCallToTender = async (callToTenderId: string) => {
  return prisma.lot.findMany({
    where: { callToTenderID: callToTenderId },
    include: {
      childLots: true,
      workpackages: true,
    },
  });
}; 