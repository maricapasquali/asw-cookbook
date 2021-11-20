export function comment(req, res){ return res.status(501).send('comment recipe')}
export function list_comments(req, res){ return res.status(501).send('list comments')}
export function response(req, res){ return res.status(501).send('response to user comment')}
export function remove_comment(req, res){ return res.status(501).send('delete comment')}