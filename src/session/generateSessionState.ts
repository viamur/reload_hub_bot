import type {MySession} from '../types/types';

export function generateSessionState(): MySession {
  return {
    collab: {
      type: "",
      region: "",
      contact: "",
    },
    pickup: {
      phone: "",
      weight: 0,
      photoFileId: "",
      region: ""
    },
  };
}
