
function ProductCard(product, index) {
  const delays = [100,200,300];
  const delay = delays[index % 3];
  return `
      <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="card product-card rounded-3">
          <img
            src="${product.image}"
            alt="${product.title}"
            class="rounded-3"
            style="height: 230px; object-fit: cover;"
          />
          <div class="card-body product-card-body">
            <h5 class="card-title fw-bold my-2">${product.title}</h5>
            <hr />
            <ul>
              ${product.companies
                .map(
                  (company) => `
                  <li>
                    <div class="d-flex">
                      <i class="bi bi-check2-all"></i>
                      <div class="d-flex align-items-center" style="width: 100%">
                        <div>${company.name}</div>
                        ${
                          company.isAuthorized
                            ? `<span class="badge rounded-pill bg-accent ms-auto" style="height: fit-content">${company.badge}</span>`
                            : ""
                        }
                      </div>
                    </div>
                  </li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
      </div>`;
}
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-cards");
  container.innerHTML = products.map(ProductCard).join("");
});
