import { SET_ALERT, REMOVE_ALERT } from './types';
import uuid from 'uuid';

// I want to be able to dispatch more than one action from this function -> we can do because of thunk middleware
export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  setTimeout(
    () =>
      dispatch({
        type: REMOVE_ALERT,
        payload: id,
      }),
    timeout
  );
};
