import { db } from "shared-models/newDb";

const service = {
  getUserFromId: async (userId: string) => {
    try {
      const user = await db.userRepo.search().where("user_name").equals(userId).returnFirst();
      if (!user) {
        throw new Error();
      }
      return user;
    } catch (e) {
      throw new Error("User not found");
    }
  },
};

export default service;
