// react-router-dom components
import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import ArgonAlert from "components/ArgonAlert";
import { Spinner } from "reactstrap";
import axios from "axios";
// import PhoneInput from "react-phone-input-2";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
import "./forgotPassword.css";
import ReCAPTCHA from "react-google-recaptcha";
import zIndex from "@mui/material/styles/zIndex";
//6LfydhoqAAAAAE2wPxlnGXh0iXc-5l1y5tu8P8Tc

// Images
const bgImage =
  "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg";
//"https://static.vecteezy.com/system/resources/previews/023/251/027/original/forgot-password-button-speech-bubble-banner-label-forgot-password-vector.jpg";
//"https://static.vecteezy.com/system/resources/previews/023/250/815/non_2x/forgot-password-button-speech-bubble-banner-label-forgot-password-vector.jpg";

function ResetPassword() {
  const recaptchaRef = useRef(null); // Tạo tham chiếu đến ReCAPTCHA
  const [password, setPassword] = useState("");
  // Loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi
  const value = password.trim();
  const [errorPasword, setErrorPassword] = useState();
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const resetPassword = async (e) => {
    e.preventDefault();
    setShowError(false);
    setSuccessMessage("");

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setErrorPassword("error token!");
      setShowError(true);
      return;
    }

    if (!password) {
      setErrorPassword("Password cannot be blank!");
      setShowError(true);
      return;
    } else if (password.length < 6 && password.length > 15) {
      setErrorPassword("Mật khẩu phải có độ dài từ 6 đến 15 ký tự");
      setShowError(true);
      return;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setErrorPassword("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
      setShowError(true);
      return;
    } else {
      // Thực hiện các hành động khác, ví dụ như gọi API để đặt lại mật khẩu
      try {
        setIsLoading(true);
        const response = await axios.post(
          `http://localhost:8080/api/forgotpassword/set-password?token=${token}&password=${password}`,
          {
            // withCredentials: true,
          }
        );
        setIsLoading(false);
        setPassword("");
        setSuccessMessage(
          response.data,
          setTimeout(() => {
            setSuccessMessage("");
            navigate("/authentication/sign-in");
          }, 5000)
        );
      } catch (error) {
        setIsLoading(false);
        if (error.response) {
          setErrorPassword(error.response.data);
        } else {
          setErrorPassword("Lỗi không xác định.Vui lòng thử lại");
        }
        setShowError(true);
      }
    }
  };

  const handleInputChange = (e) => {
    setPassword(e.target.value);
    if (errorPasword) {
      setShowError(false);
    }
    setErrorPassword("");
    setSuccessMessage("");
  };

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    // Clean up on component unmount
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isLoading]);
  return (
    <CoverLayout
      //title="Welcome!"
      //description="Use these awesome forms to login or create new account in your project for free."
      image={bgImage}
      imgPosition="top"
      button={{ color: "dark", variant: "gradient" }}
      imageStyle={{ zIndex: 1000, position: "relative" }}
    >
      <div className="content-wrapper">
        {isLoading && (
          <div className="loading-overlay">
            <Spinner color="primary" />
          </div>
        )}
        <Card w={50} className="mb-5">
          <ArgonBox p={3} mb={1} textAlign="center">
            <ArgonTypography variant="h5" fontWeight="medium">
              Đặt lại mật khẩu
            </ArgonTypography>
          </ArgonBox>
          <ArgonBox pt={2} pb={3} px={3}>
            <ArgonBox component="form" role="form" onSubmit={resetPassword}>
              <ArgonBox mb={3}>
                {showError && errorPasword && (
                  <ArgonAlert
                    color="error"
                    dismissible
                    onClick={() => setShowError(false)}
                    style={{ fontSize: "0.9rem", padding: "0.5rem 0.5rem" }}
                  >
                    {errorPasword}
                  </ArgonAlert>
                )}
                {successMessage && (
                  <ArgonAlert
                    color="success"
                    dismissible
                    onClick={() => setSuccessMessage("")}
                    style={{
                      fontSize: "0.9rem",
                      padding: "0.5rem",
                      textAlign: "justify",
                    }}
                  >
                    {successMessage}
                  </ArgonAlert>
                )}

                <ArgonInput
                  placeholder="Mật khẩu"
                  type="password"
                  value={password}
                  onChange={handleInputChange}
                  error={!!errorPasword}
                  disabled={isLoading} // Disable input khi loading
                  style={{ fontSize: "1.25rem", padding: "0.75rem", width: "100%" }}
                />
              </ArgonBox>
              <ArgonBox mt={3} mb={1}>
                <ArgonButton
                  type="submit"
                  color="info"
                  style={{
                    width: "100%",
                    maxWidth: "325px",
                    fontSize: "1.05rem",
                    padding: "0.75rem",
                  }}
                  disabled={isLoading ? isLoading : !password} // Disable button khi loading
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" /> {/* Reactstrap Spinner nhỏ */}
                      <span style={{ marginLeft: "0.5rem" }}>Loading...</span>
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>
          </ArgonBox>
        </Card>
      </div>
    </CoverLayout>
  );
}

export default ResetPassword;
