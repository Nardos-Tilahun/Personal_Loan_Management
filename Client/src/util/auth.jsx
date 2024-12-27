
const getAuth = async () => {
  const user = await JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    const decodedToken = await decodeTokenPayload(user.token);
    user.userRoleId = decodedToken.userRoleId;
    user.userHashId = decodedToken.userHashId;
    user.email = decodedToken.email;
    user.firstName = decodedToken.firstName;
    user.lastName = decodedToken.lastName;
    user.userImage = decodedToken.userImage;
    return user;
  } else {
    return {};
  }
};


const decodeTokenPayload = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
};




export default getAuth;