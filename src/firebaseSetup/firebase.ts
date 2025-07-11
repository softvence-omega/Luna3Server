// import admin from 'firebase-admin';
// import serviceAccount from './luna-3-7e89c-firebase-adminsdk-fbsvc-f69f5f559c.json';

// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: serviceAccount.project_id,
//     clientEmail: serviceAccount.client_email,
//     privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
//   }),
// });

// export default admin;


import admin from 'firebase-admin';
import config from '../config';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.firebase.project_id,
    clientEmail: config.firebase.client_email,
    privateKey: config.firebase.private_key, // already replaced \n in config.ts
  }),
});

export default admin;
