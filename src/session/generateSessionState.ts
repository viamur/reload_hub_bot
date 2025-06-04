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
      weight: "",
      photoFileId: "",
      region: ""
    },
  };
}
