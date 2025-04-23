import { db } from '../db'
import recordGet from './record-get'

export default recordGet(db.matches, 'Match')
