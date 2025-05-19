import React, { useEffect, useState, useRef } from "react";
import ArgonBox from "components/ArgonBox";
import ArgonButton from "components/ArgonButton";
import { CircularProgress, Typography } from "@mui/material";
import DiscountIcon from "@mui/icons-material/LocalOffer";
import VoucherService from "../../../services/VoucherServices";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ProductService from "../../../services/ProductServices";
import { Link } from "react-router-dom";
import reviewsService from "services/ReviewsServices";

const Voucher = ({ voucher, onApplyVoucher }) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <ArgonBox
            sx={{
                border: "1px solid #FFD700",
                borderRadius: "12px",
                padding: "15px",
                display: "flex",
                maxWidth: "480px",
                margin: "10px 5px",
                backgroundColor: "#FFF8E1",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                flexWrap: "nowrap",
            }}
        >
            <ArgonBox sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                <DiscountIcon
                    sx={{
                        color: "#FF4500",
                        fontSize: "32px",
                        marginRight: "10px",
                        marginLeft: "-10px",
                        marginTop: "-100px",
                        flexShrink: 0,
                    }}
                />
                <ArgonBox sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    <ArgonBox
                        sx={{
                            background: "linear-gradient(to right, #FFD700, #FFA500)",
                            padding: "3px 8px",
                            color: "#000",
                            fontWeight: "bold",
                            display: "inline-block",
                            borderRadius: "8px",
                            fontSize: "12px",
                            marginBottom: "4px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        VOUCHER
                    </ArgonBox>
                    <ArgonBox
                        sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            color: "#FF4500",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        Mã: {voucher.code}
                    </ArgonBox>
                    <ArgonBox
                        sx={{
                            fontSize: "12px",
                            color: "#333",
                            marginTop: "3px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        Giảm <strong>{voucher.discountPercentage}%</strong> khi hóa đơn từ {voucher.minimumOrderValue}đ
                    </ArgonBox>
                    <ArgonBox
                        sx={{
                            fontSize: "12px",
                            color: "#333",
                            marginTop: "3px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        HSD: {formatDate(voucher.endDate)}
                    </ArgonBox>
                </ArgonBox>
            </ArgonBox>
            <ArgonBox sx={{ textAlign: "right", flexShrink: 0 }}>
                <ArgonBox
                    sx={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#FF4500",
                        whiteSpace: "nowrap",
                    }}
                >
                    Giảm {voucher.discountPercentage}%
                </ArgonBox>
                <ArgonButton
                    sx={{
                        backgroundColor: "#FF4500",
                        background: "linear-gradient(to right, #FF7F50, #FF4500)",
                        color: "#fff",
                        fontWeight: "bold",
                        marginTop: "8px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        whiteSpace: "nowrap",
                        "&:hover": {
                            background: "linear-gradient(to right, #FF4500, #FF6347)",
                        },
                    }}
                    onClick={() => onApplyVoucher(voucher)}
                >
                    Áp dụng cho
                </ArgonButton>
            </ArgonBox>
        </ArgonBox>
    );
};

Voucher.propTypes = {
    voucher: PropTypes.shape({
        code: PropTypes.string.isRequired,
        discountPercentage: PropTypes.number.isRequired,
        minimumOrderValue: PropTypes.number.isRequired,
        endDate: PropTypes.string.isRequired,
    }).isRequired,
    onApplyVoucher: PropTypes.func.isRequired,
};



const CustomPrevArrow = ({ onClick }) => (
    <ArrowBackIosIcon
        onClick={onClick}
        sx={{
            position: "absolute",
            top: "-20px",
            right: "100px",
            zIndex: 1,
            cursor: "pointer",
            fontSize: "28px",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
                transform: "scale(1.2)",
            },
        }}
    />
);

CustomPrevArrow.propTypes = {
    onClick: PropTypes.func.isRequired,
};

const CustomNextArrow = ({ onClick }) => (
    <ArrowForwardIosIcon
        onClick={onClick}
        sx={{
            position: "absolute",
            top: "-20px",
            right: "80px",
            zIndex: 1,
            cursor: "pointer",
            fontSize: "28px",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
                transform: "scale(1.2)",
            },
        }}
    />
);

CustomNextArrow.propTypes = {
    onClick: PropTypes.func.isRequired,
};


const VoucherList = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usedVouchers, setUsedVouchers] = useState([]);
    const accountId = Cookies.get('accountId');
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const voucherRequests = [VoucherService.getAllVouchers()];
                if (accountId) {
                    voucherRequests.push(VoucherService.getUsedVouchersByAccount(accountId));
                }

                const [voucherResponse, usedVoucherResponse] = await Promise.all(voucherRequests);
                const activeVouchers = voucherResponse.data.filter(voucher => voucher.isActive);

                setVouchers(activeVouchers);
                setUsedVouchers(usedVoucherResponse ? usedVoucherResponse.data : []);
            } catch (error) {
                console.error("Error fetching voucher data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accountId]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ProductService.getAllProducts();
                setProducts(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            }
        };

        fetchProducts();
    }, []);

    const availableVouchers = vouchers.filter(
        voucher => !usedVouchers.some(usedVoucher => usedVoucher.id === voucher.id)
    );


    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatImportPrice = (importPrice) => {
        if (!importPrice) return "0đ";

        const prices = importPrice.split('-').map(price => {
            const trimmedPrice = price.trim();
            const numericPrice = parseFloat(trimmedPrice);
            const integerPrice = Math.floor(numericPrice);
            return `${formatNumber(integerPrice)}đ`;
        });

        return prices.join(' - ');
    };




    const handleApplyVoucher = (voucher) => {
        if (voucher.minimumOrderValue === undefined || voucher.minimumOrderValue === null || voucher.minimumOrderValue === "") {
            console.error('Voucher does not have a valid minimumOrderValue:', voucher);
            return;
        }

        console.log('Voucher minimumOrderValue:', voucher.minimumOrderValue);

        let minPrice;
        if (typeof voucher.minimumOrderValue === "string") {
            minPrice = voucher.minimumOrderValue
                .split('-')[0]
                .trim()
                .replace('đ', '')
                .replace('.', '');

            minPrice = parseInt(minPrice);
        } else if (typeof voucher.minimumOrderValue === "number") {
            minPrice = voucher.minimumOrderValue;
        }

        minPrice = minPrice;
        if (isNaN(minPrice)) {
            console.error('Voucher minimumOrderValue is invalid:', voucher.minimumOrderValue);
            return;
        }

        console.log('Voucher minimumOrderValue (minPrice):', minPrice);
        const filtered = products.filter(product => {
            if (!product.importPrice || product.importPrice.trim() === "") return false;

            const productPrices = product.importPrice
                .split('-')
                .map(price => {
                    return parseInt(price.trim().replace('đ', '').replace('.', '').replace(/[^0-9]/g, ''));
                });

            const productMinPrice = productPrices[1];
            const adjustedProductMinPrice = productMinPrice / 10;
            if (isNaN(adjustedProductMinPrice)) return false;
            console.log('Product minimum price (adjusted productMinPrice):', adjustedProductMinPrice);
            const isValid = adjustedProductMinPrice >= minPrice;
            console.log('Is product valid? ', isValid);

            return isValid;
        });

        setFilteredProducts(filtered);
    };

    const fetchReviews = async (productId) => {
        try {
            const productReviews = await reviewsService.getReviewsByProduct(productId);
            setReviews((prevReviews) => [...prevReviews, ...productReviews]);
        } catch (error) {
            setReviews([]);
        }
    };

    useEffect(() => {
        if (products.length > 0) {
            products.forEach((product) => {
                fetchReviews(product.id);
            });
        }
    }, [products]);

    const calculateAverageStars = (productId) => {
        const productReviews = reviews.filter((review) => review.productId === productId);
        if (productReviews.length === 0) return 0;

        const totalStars = productReviews.reduce((sum, review) => sum + review.star, 0);
        return (totalStars / productReviews.length).toFixed(1);
    };

    const sliderRef = useRef(null);

    const settings = {
        dots: false, // Không hiển thị các chấm (có thể bật nếu cần)
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024, // Tablet và nhỏ hơn
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768, // Mobile
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480, // Mobile nhỏ hơn
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <>
            <div style={{ position: "relative" }}>
                <div className="px-xl-5 pb-3">
                    {availableVouchers.length === 0 ? (
                        <Typography variant="h6">Không có voucher nào.</Typography>
                    ) : (
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}>
                            {availableVouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    style={{
                                        flex: "1 1 calc(30% - 16px)",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <Voucher voucher={voucher} onApplyVoucher={handleApplyVoucher} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="container-fluid pt-0 pb-3">

                <div className="row px-xl-5">
                    <div className="d-flex justify-content-end align-items-center mb-3">
                        <div className="d-flex justify-content-end">
                            <button
                                className="btn me-2"
                                onClick={() => sliderRef.current.slickPrev()}
                                style={{ backgroundColor: 'transparent', border: 'none', color: 'black', fontSize: '30px' }}
                            >
                                &lt;
                            </button>
                            <button
                                className="btn me-3"
                                onClick={() => sliderRef.current.slickNext()}
                                style={{ backgroundColor: 'transparent', border: 'none', color: 'black', fontSize: '30px' }}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                    <Slider ref={sliderRef} {...settings}>
                        {products.map((product, index) => (
                            <div className="px-2" key={index}>
                                <div className="product-item bg-light mb-4">
                                    <div className="product-img position-relative overflow-hidden">
                                        <Link to={`/ShopDetail?id=${product.id}`}>
                                            <img
                                                className="img-fluid w-100"
                                                src={product.image || aboutImage5}
                                                alt={product.name || "Product"}
                                            />
                                        </Link>
                                    </div>
                                    <div className="py-4 px-2">
                                        <Link
                                            className="h6 text-decoration-none text-truncate"
                                            to={`/ShopDetail?id=${product.id}`}
                                        >
                                            {product.name || "Product Name Goes Here"}
                                        </Link>
                                        <div className="d-flex mb-1">
                                            <strong style={{ color: "red" }}>
                                                {formatImportPrice(product.importPrice)}
                                            </strong>
                                        </div>
                                        <div className="d-flex mb-1">
                                            <strong>⭐ {calculateAverageStars(product.id)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>

        </>
    );
};


export default VoucherList;