import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {    
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    
    if(!authHeader) {
        return res.status(401).json({ error: 'Token not provided' })
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = await promisify(jwt.verify)(token, authConfig.secret);

        // eslint-disable-next-line require-atomic-updates
        req.userId = decoded.id;
         
        return next();

    } catch (err) {
        return res.status(401).json({ error: 'Token invalid' })
    }
}
