import React, { useState, useRef } from "react";
import { Box, Typography, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ArgonBox from "components/ArgonBox";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import ArgonButton from "components/ArgonButton";
import BackupIcon from "@mui/icons-material/Backup";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from 'config/firebase-config';

import PropTypes from "prop-types";

const ImageUploader = ({ onUploadComplete }) => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024); // 5MB limit
        if (validFiles.length < files.length) {
            alert("Some files were not added due to size or type restrictions.");
        }
        const newImages = validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prevImages) => [...prevImages, ...newImages]);
    };

    const handleDropzoneClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleRemoveAll = () => {
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
    };

    const handleUpload = async () => {
        setUploading(true);
        try {
            const uploadPromises = images.map(async (img) => {
                const storageRef = ref(storage, `images/${Date.now()}_${img.file.name}`);
                await uploadBytes(storageRef, img.file);
                return await getDownloadURL(storageRef);
            });
            const uploadedUrls = await Promise.all(uploadPromises);
            setUploading(false);
            onUploadComplete(uploadedUrls);
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Failed to upload some images. Please try again.");
            setUploading(false);
        }
    };

    return (
        <ArgonBox
            display="flex"
            flexDirection="column"
            mt={3}
            mx={{ xs: 1, sm: 2, md: 3 }}
            p={2}
            mb={3}
            border={"1px solid #ccc"}
            borderRadius="8px"
        >
            <Box sx={{ width: "100%", textAlign: "center" }}>
                <Box
                    sx={{
                        width: "100%",
                        height: 250,
                        border: "1px dashed #ccc",
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f9f9f9",
                        mb: 2,
                        cursor: "pointer",
                        color: "#6c757d",
                    }}
                    onClick={handleDropzoneClick}
                >
                    <AddIcon sx={{ fontSize: 50, color: "#6c757d" }} />
                    <Typography variant="h6" sx={{ color: "#6c757d", mt: 1 }}>
                        Add images
                    </Typography>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: "none" }}
                    />
                </Box>

                {images.length > 0 && (
                    <Box sx={{ textAlign: "left", mt: 2 }}>
                        <Grid container spacing={1}>
                            {images.map((img, index) => (
                                <Tooltip TransitionComponent={Zoom} title={img.preview} key={index}>
                                    <Grid item sx={{ mr: 2 }}>
                                        <Box
                                            sx={{
                                                position: "relative",
                                                width: 100,
                                                height: 100,
                                                borderRadius: 3,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={img.preview}
                                                alt={`Preview ${index}`}
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveImage(index)}
                                                sx={{
                                                    position: "absolute",
                                                    top: 5,
                                                    right: 5,
                                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                    boxShadow: 1,
                                                    "&:hover": {
                                                        backgroundColor: "rgba(255, 255, 255, 1)",
                                                    },
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Tooltip>
                            ))}
                        </Grid>
                    </Box>
                )}

                {images.length > 0 && (
                    <Box sx={{ mt: 3, display: "flex", justifyContent: "end" }}>
                        <ArgonButton
                            variant="outlined"
                            color="dark"
                            onClick={handleRemoveAll}
                            sx={{ textTransform: "none", marginRight: "12px" }}
                        >
                            Remove all
                        </ArgonButton>
                        <ArgonButton
                            variant="gradient"
                            color="dark"
                            sx={{ textTransform: "none" }}
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            <BackupIcon /> &nbsp;
                            {uploading ? "Uploading..." : "Upload"}
                        </ArgonButton>
                    </Box>
                )}
            </Box>
        </ArgonBox>
    );
};

ImageUploader.propTypes = {
    onUploadComplete: PropTypes.func.isRequired,
};

export default ImageUploader;