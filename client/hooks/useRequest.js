import { useState } from "react";
import axios from "axios";

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    setErrors(null);
    try {
      const response = await axios[method.toLowerCase()](url, {
        ...body,
        ...props,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (error) {
      console.log("An Error occured oo", error);
      setErrors(
        <div className="alert my-1 alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {error.response.data.errors.map((error) => (
              <li key={error.message}> {error.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
