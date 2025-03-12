
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ VR Script Loaded Successfully!");

    // Global Variables
    let selectedHouse = null;
    let currentRoom = null;
    let infoVisible = true;
    
    // Simulate loading
    setTimeout(() => {
        document.getElementById("loadingOverlay").style.display = "none";
    }, 1500);

    // House Properties Data
    const propertyData = {
        1: {
            title: "Luxury Villa",
            area: "2400 sq.ft",
            price: "$850,000",
            location: "Silicon Valley, CA"
        },
        2: {
            title: "Modern Apartment",
            area: "1800 sq.ft",
            price: "$650,000",
            location: "Downtown, NY"
        }
    };

    // ✅ Room Image Mapping (Both Houses Have Same Images)
    const roomImages = {
        1: { 
            hall: "https://t3.ftcdn.net/jpg/09/29/41/98/240_F_929419883_Dbn6beKYOXu0Ll6PxSqz0ksAMca5mzdE.jpg",
            kitchen: "https://as1.ftcdn.net/v2/jpg/06/79/41/24/1000_F_679412412_f7mnEooIM3zdIRcy61cEYe68IZZ6fyE0.jpg",
            bathroom: "https://as2.ftcdn.net/v2/jpg/02/86/05/63/1000_F_286056301_Vq1kNIWq71w1aVrwefXjkvCUhdfTFOkb.jpg",
            balcony: "https://t4.ftcdn.net/jpg/02/87/62/31/240_F_287623138_e2L8P4QE7SLalHI3Ekma4BpePue664kb.jpg"
        },
        2: { 
            hall: "https://t3.ftcdn.net/jpg/09/29/41/98/240_F_929419883_Dbn6beKYOXu0Ll6PxSqz0ksAMca5mzdE.jpg",
            kitchen: "https://as1.ftcdn.net/v2/jpg/06/79/41/24/1000_F_679412412_f7mnEooIM3zdIRcy61cEYe68IZZ6fyE0.jpg",
            bathroom: "https://as2.ftcdn.net/v2/jpg/02/86/05/63/1000_F_286056301_Vq1kNIWq71w1aVrwefXjkvCUhdfTFOkb.jpg",
            balcony: "https://t4.ftcdn.net/jpg/02/87/62/31/240_F_287623138_e2L8P4QE7SLalHI3Ekma4BpePue664kb.jpg"
        }
    };

    // ✅ House Selection
    window.selectHouse = function (houseNumber) {
        selectedHouse = houseNumber;
        
        // Show loading animation
        document.getElementById("loadingOverlay").style.display = "flex";
        document.getElementById("loadingOverlay").querySelector(".loading-text").textContent = "Preparing Virtual Tour...";
        
        setTimeout(() => {
            // Update property details
            document.getElementById("propertyArea").textContent = propertyData[houseNumber].area;
            document.getElementById("propertyPrice").textContent = propertyData[houseNumber].price;
            document.getElementById("propertyLocation").textContent = propertyData[houseNumber].location;
            
            document.getElementById("houseMenu").style.display = "none";
            document.getElementById("roomMenu").style.display = "block";
            document.getElementById("loadingOverlay").style.display = "none";
            
            // Add animation when showing the room menu
            document.getElementById("roomMenu").style.animation = "none";
            setTimeout(() => {
                document.getElementById("roomMenu").style.animation = "slideUpFadeIn 0.5s ease-out forwards";
            }, 10);
            
            console.log(`🏠 Selected House ${houseNumber} - ${propertyData[houseNumber].title}`);
        }, 800);
    };

    // ✅ Show Selected Room in VR
    window.showRoom = function (room) {
        if (selectedHouse && roomImages[selectedHouse][room]) {
            currentRoom = room;
            
            // Show loading animation
            document.getElementById("loadingOverlay").style.display = "flex";
            document.getElementById("loadingOverlay").querySelector(".loading-text").textContent = "Loading 360° View...";
            
            setTimeout(() => {
                document.getElementById("roomMenu").style.display = "none";
                document.getElementById("vr-container").style.display = "block";
                
                // Set the 360° image
                document.querySelector("#vr-sky").setAttribute("src", roomImages[selectedHouse][room]);
                
                // Update house title with current room
                const roomNames = {
                    'hall': 'Living Room',
                    'kitchen': 'Kitchen',
                    'bathroom': 'Bathroom',
                    'balcony': 'Balcony'
                };
                
                document.getElementById("houseTitle").innerText = `${propertyData[selectedHouse].title} - ${roomNames[room]}`;
                document.getElementById("contactInfo").style.display = "block";
                document.getElementById("vrInstructions").style.display = "block";
                
                // Update active room dot
                document.querySelectorAll(".room-dot").forEach(dot => {
                    dot.classList.remove("active");
                });
                document.getElementById(`${room}Dot`).classList.add("active");
                
                document.getElementById("loadingOverlay").style.display = "none";
                
                console.log(`🎯 Viewing ${roomNames[room]} of ${propertyData[selectedHouse].title}`);
            }, 1000);
        } else {
            console.error("❌ Room image not found!");
        }
    };

    // ✅ Go Back to House Selection
    window.goBack = function () {
        document.getElementById("roomMenu").style.display = "none";
        document.getElementById("houseMenu").style.display = "block";
        
        // Add animation when showing the house menu
        document.getElementById("houseMenu").style.animation = "none";
        setTimeout(() => {
            document.getElementById("houseMenu").style.animation = "slideUpFadeIn 0.5s ease-out forwards";
        }, 10);
        
        console.log("🔙 Back to House Selection");
    };

    // ✅ Exit VR and Return to Room Selection
    window.exitVR = function () {
        document.getElementById("vr-container").style.display = "none";
        document.getElementById("roomMenu").style.display = "block";
        document.getElementById("contactInfo").style.display = "none";
        document.getElementById("vrInstructions").style.display = "none";
        
        // Add animation when showing the room menu again
        document.getElementById("roomMenu").style.animation = "none";
        setTimeout(() => {
            document.getElementById("roomMenu").style.animation = "slideUpFadeIn 0.5s ease-out forwards";
        }, 10);
        
        console.log("🔙 Exit VR and return to Room Menu");
    };
    
    // Handle Fullscreen Toggle
    document.getElementById("fullscreenBtn").addEventListener("click", function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // Toggle Information Display
    document.getElementById("infoToggleBtn").addEventListener("click", function() {
        if (infoVisible) {
            document.getElementById("contactInfo").style.display = "none";
            document.getElementById("vrInstructions").style.display = "none";
        } else {
            document.getElementById("contactInfo").style.display = "block";
            document.getElementById("vrInstructions").style.display = "block";
        }
        infoVisible = !infoVisible;
    });
    
    // Close Instructions
    document.getElementById("closeInstructions").addEventListener("click", function() {
        document.getElementById("vrInstructions").style.display = "none";
    });
    
    // Contact Agent Button
    document.querySelector(".contact-btn").addEventListener("click", function() {
        alert(`Our agent will contact you shortly about ${propertyData[selectedHouse].title}!`);
    });
    
    // Keyboard Navigation (Escape to exit VR)
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && document.getElementById("vr-container").style.display === "block") {
            exitVR();
        }
    });
});
