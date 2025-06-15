function AdvantageCard({ imgSrc, altText, title, description, delay }) {
  return `
    <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="card advantage-card rounded-3" >
            <img src="${imgSrc}" alt="${altText}" class="rounded-3" style="height: 150px; object-fit: cover;" />
            <div class="card-body card-content">
                <h4>${title}</h4>
                <p>${description}</p>
            </div>
        </div>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
  const holder = document.getElementById("advantages-cards");
  holder.innerHTML = advantagesOfRoboflair.map(AdvantageCard).join("");
});
