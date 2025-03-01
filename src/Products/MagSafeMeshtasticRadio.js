import React, { useState, useEffect } from 'react';
import ProductHandler from '../Products/ProductHandler.js';
import mesh from '../images/mesh.jpg';
import meshblue from '../images/meshblue.jpg';
import mesh3 from '../images/mesh3.jpg';
import mesh4 from '../images/mesh4.jpg';
import mesh5 from '../images/mesh5.jpg';
import mesh6 from '../images/mesh6.JPG';
import { FaExclamationTriangle } from 'react-icons/fa';
// Import additional images here if you have them
// import meshImage2 from '../images/mesh2.jpg';
// import meshImage3 from '../images/mesh3.jpg';






function Product() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ethPrice, setEthPrice] = useState(null);
  
  const FIXED_USD_PRICE = 15;

  useEffect(() => {
    const updateEthPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        const ethUsdPrice = data.ethereum.usd;
        
        const ethAmount = FIXED_USD_PRICE / ethUsdPrice;
        setEthPrice(ethAmount.toFixed(8));
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    // Immediate update when component mounts
    updateEthPrice();

    // Update every 5 seconds
    const interval = setInterval(updateEthPrice, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionComplete = urlParams.get('transaction');
    const shouldDownload = urlParams.get('download');
    
    if (transactionComplete === 'complete' && shouldDownload === 'true') {
        // Add a small delay to ensure the browser is ready to handle the download
        setTimeout(() => {
            initiateDownload(productDetails.downloadUrl, productDetails.fileName);
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 1000);
    }
  }, []);

  const productDetails = {
    id: 'test-product',
    price: ethPrice,
    fileName: 'MagSafeMeshtasticRadio-files.zip',
    downloadUrl: '/ProductFiles/MagSafeMeshtasticRadio-files.zip'
  };

  const initiateDownload = (url, filename) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          resolve();
        })
        .catch(error => {
          console.error('Download error:', error);
          reject(error);
        });
    });
  };

  const handleBuyClick = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
        const success = await ProductHandler.handlePurchase(productDetails.price, productDetails.id);
        
        if (success) {
            try {
                await initiateDownload(productDetails.downloadUrl, productDetails.fileName);
                console.log('Download initiated successfully');
            } catch (downloadError) {
                console.error('Download failed:', downloadError);
                alert('Purchase successful but download failed. Please contact support.');
            }
        }
    } catch (error) {
        console.error("Purchase error:", error);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            alert("Insufficient funds to complete the transaction (including gas fees).");
        } else if (error.code === 'USER_REJECTED') {
            alert("Transaction was rejected by user.");
        } else {
            alert(`An error occurred during purchase: ${error.message}`);
        }
    } finally {
        setIsProcessing(false);
    }
  };








  const images = [
    mesh,
    meshblue,
    mesh3,
    mesh4,
    mesh5,
    mesh6,
    // meshImage2,
    // meshImage3
  ];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section className="product-section">
      <div className="product-container">
        <div className="product-image-container">
          <img 
            src={images[currentImageIndex]} 
            alt="MagSafe Meshtastic Radio Node" 
            onClick={nextImage}
            className="product-image"
          />
          <div className="image-dots">
            {images.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="product-info">
          <h1>MagSafe Meshtastic Radio Node</h1>
          <p className="product-description">
            Digital files for a MagSafe compatible radio node for the Meshtastic project. 
            This innovative design combines the convenience of magnetic mounting with the 
            powerful mesh networking capabilities of Meshtastic. Perfect for creating your 
            own off-grid communication network.
            <br /><br />
            <div className="wallet-notice">
              <FaExclamationTriangle />
              <span>Note: Only Coinbase Wallet is accepted at this time.</span>
            </div>
          </p>
          <div className="price-container">
            <span className="price">
              {ethPrice ? `Ξ ${ethPrice}` : 'Loading price...'}
            </span>
            <button 
              className="primarybutton buy-button"
              onClick={handleBuyClick}
              disabled={isProcessing || !ethPrice}
            >
              {isProcessing ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Product;
