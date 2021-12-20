export default {
    isAdmin: state => state.user && state.user.isAdmin,

    isSigned: state => state.user && state.user.isSigned,

    isGuestOrSigned: state => !state.user || state.user.isSigned,

    isLoggedIn: state => state.user && state.accessToken && state.refreshToken,

    username: state => state.user && state.user.userID,

    userIdentifier: state => state.user && state.user._id,

    userFriends: state => state.user && state.user.friends,

    accessToken: state => state.accessToken,

    refreshToken: state => state.refreshToken,

    socket: state => state.socket
}