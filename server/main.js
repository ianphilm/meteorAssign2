import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Users } from '../imports/api/collections_def.js'
import { Messages } from '../imports/api/collections_def.js'

import '../imports/api/collections_def.js';

// on server startup, remove all DB data from Collections and re-fill with default data
Users.remove({});
Messages.remove({});