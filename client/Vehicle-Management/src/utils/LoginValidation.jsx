function Validation(values) {
  let error = {};

  if (values.username === "") {
    error.username = "Please Input Username";
  } else {
    error.username = "";
  }

  if (values.password === "") {
    error.password = "Please Input Password";
  } else {
    error.password = "";
  }

  return error;
}

export default Validation;
