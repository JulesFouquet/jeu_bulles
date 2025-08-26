// Script pour générer les bulles flottantes derrière les formulaires

const bubbleContainer = document.getElementById('bubble-background');

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    const size = Math.random() * 60 + 20; // entre 20px et 80px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    // position initiale
    bubble.style.left = `${Math.random() * window.innerWidth}px`;
    bubble.style.top = `${window.innerHeight + size}px`; // start below view
    
    bubbleContainer.appendChild(bubble);
    
    // animation
    const speed = Math.random() * 3 + 2; // vitesse
    let pos = window.innerHeight + size;
    
    function animate() {
        pos -= speed;
        bubble.style.top = pos + 'px';
        if (pos + size > 0) {
            requestAnimationFrame(animate);
        } else {
            bubble.remove();
        }
    }
    
    animate();
}

// créer une bulle toutes les 0.5s
setInterval(createBubble, 500);
