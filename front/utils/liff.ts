import { LineUser } from "../../functions/src/types";

export const getLiffProfile = async () => {
  const liff = (await import("@line/liff")).default;
  const profilePromise = liff.getProfile();
  const tokenPromise = liff.getAccessToken();
  const idTokenPromise = liff.getIDToken();
  const profile = await profilePromise;
  const token = await tokenPromise;
  const idToken = await idTokenPromise;

  if (token && idToken) {
    const lineUser: LineUser = {
      expire: new Date().getTime() + 1000 * 60 * 5,
      userId: profile.userId,
      name: profile.displayName,
      image: profile.pictureUrl,
      token: token,
      idToken: idToken,
    };

    return lineUser;
  }
  // });
};
