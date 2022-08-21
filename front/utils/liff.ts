import { LineUser } from "types";

export const getLiffProfile = async (liff: {
  getProfile: () => any;
  getAccessToken: () => any;
  getIDToken: () => any;
}) => {
  // LIFF Profile
  const profilePromise = liff.getProfile();
  const tokenPromise = liff.getAccessToken();
  const idTokenPromise = liff.getIDToken();
  const profile = await profilePromise;
  const token = await tokenPromise;
  const idToken = await idTokenPromise;

  const lineUser: LineUser = {
    expire: new Date().getTime() + 1000 * 60 * 30,
    userId: profile.userId,
    name: profile.displayName,
    image: profile.pictureUrl,
    token: token,
    idToken: idToken,
  };

  return lineUser;
};
