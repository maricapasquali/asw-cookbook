export default {
    tempAccessToken: state => state.resetPassword._temporaryAccessToken,
    tempUserIdentifier: state => state.resetPassword._temporaryUserIdentifier,
    isInTempSession: state => state.resetPassword._temporaryAccessToken && state.resetPassword._temporaryUserIdentifier
}