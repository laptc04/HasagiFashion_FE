import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import ArgonInput from "../../../components/ArgonInput";
import ArgonButton from "../../../components/ArgonButton";
import ArgonBox from "../../../components/ArgonBox";
import ArgonTypography from "../../../components/ArgonTypography";
import DataTable from "./data";
import Footer from "../../../examples/Footer";
import CategoryService from "../../../services/CategoryServices";
import { Image } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storage } from "../../../config/firebase-config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


function Category() {
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      const response = await CategoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file || formData.image,
    });
  };


  const validateForm = () => {
    const newErrors = { name: false, image: false };

    if (!formData.name.trim()) {
      newErrors.name = true;
      toast.warn("Vui lòng nhập tên Danh mục!!!");
    }
    if (!formData.image) {
      newErrors.image = true;
      toast.warn("Vui lòng chọn ảnh Danh mục!!!");
    }

    setErrors(newErrors);
    console.log("Form errors: ", newErrors);

    return !newErrors.name && !newErrors.image;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      console.log("Form is invalid. Aborting submit.");
      return;
    }

    try {
      let imageUrl;
      if (formData.image instanceof File) {
        const imageFile = formData.image;
        const storageRef = ref(storage, `categories/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              console.log(
                `Upload progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`
              );
            },
            (error) => {
              console.error("Error uploading file:", error);
              toast.error("Lỗi khi tải ảnh lên Firebase.");
              reject(error);
            },
            async () => {
              try {
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch (error) {
                console.error("Error getting download URL:", error);
                toast.error("Lỗi khi lấy URL ảnh.");
                reject(error);
              }
            }
          );
        });
      } else {
        imageUrl = formData.image;
      }

      const data = {
        name: formData.name,
        image: imageUrl,
      };

      const formDataObj = new FormData();
      formDataObj.append("name", data.name);
      formDataObj.append("image", data.image);

      let result;
      if (formData.id) {
        result = await CategoryService.updateCategory(formData.id, formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setCategories(categories.map((category) => (category.id === result.data.id ? result.data : category)));
        toast.success("Cập nhật Danh mục thành công");
      } else {
        result = await CategoryService.createCategory(formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setCategories([...categories, result.data]);
        toast.success("Thêm Danh mục thành công");
      }
      fetchData();
      resetForm();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };



  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      image: null,
    });
    setErrors({});
  };

  const handleEditClick = (category) => {
    setFormData(category);
    setErrors({});
  };

  const handleDeleteClick = async (selectedRows) => {
    if (selectedRows.length === 0) return;

    for (const id of selectedRows) {
      try {
        await CategoryService.deleteCategory(id);
      } catch (error) {
        console.error(`${id}`, error);
      }
    }
    fetchData();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      <ArgonBox py={3}>
        <ArgonBox mb={3}>
          <Card>
            <ArgonBox display="flex" justifyContent="space-between" p={3}>
              <ArgonTypography variant="h6">Quản lý Danh mục</ArgonTypography>
            </ArgonBox>
            <ArgonBox
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems="center"
              p={3}
              component="form"
              role="form"
              onSubmit={handleSubmit}
            >
              <ArgonBox
                mb={3}
                mx={3}
                width={{ xs: "100%", md: 400 }}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <ArgonBox
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width={{ xs: "100%", md: 300 }} // Responsive width for image box
                  height={300}
                  borderRadius="12px"
                  boxShadow="0 0 15px rgba(0,0,0,0.1)"
                  overflow="hidden"
                  mb={2}
                >
                  <Image
                    src={
                      formData.image && formData.image instanceof File
                        ? URL.createObjectURL(formData.image)
                        : formData.image ||
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
                    }
                    alt="Category Preview"
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </ArgonBox>
                <ArgonButton
                  component="label"
                  variant="outlined"
                  color="info"
                  size="large"
                  sx={{
                    width: "100%",
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#d0d0d0",
                    },
                  }}
                >
                  Chọn ảnh
                  <input type="file" name="image" hidden onChange={handleFileChange} />
                </ArgonButton>
              </ArgonBox>

              <ArgonBox
                width={{ xs: "100%" }} // Responsive width for input box
                display="flex"
                flexDirection="column"
              >
                <ArgonBox mb={3}>
                  <ArgonBox>
                    <ArgonInput
                      type="text"
                      placeholder="Tên Danh mục"
                      size="large"
                      fullWidth
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </ArgonBox>
                  {errors.name && (
                    <ArgonTypography variant="caption" color="error">
                      {errors.name}
                    </ArgonTypography>
                  )}
                </ArgonBox>

                <ArgonBox mb={3} width={720} display="flex" gap={1} justifyContent="flex-start">
                  <ArgonButton
                    type="submit"
                    size="large"
                    color="info"
                    sx={{ minWidth: 100, padding: '8px 16px' }}
                  >
                    {formData.id ? "Cập nhật" : "Thêm"}
                  </ArgonButton>
                  <ArgonButton
                    size="large"
                    color="primary"
                    sx={{ minWidth: 100, padding: '8px 16px' }}
                    onClick={resetForm}
                  >
                    Làm mới
                  </ArgonButton>
                </ArgonBox>

              </ArgonBox>
            </ArgonBox>
          </Card>
        </ArgonBox>
      </ArgonBox>

      <ArgonBox>
        <ArgonBox mb={3}>
          <Card>
            <DataTable
              categories={categories}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          </Card>
        </ArgonBox>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Category;