import packages from './packages.js';

document.addEventListener('DOMContentLoaded', () => {
    // Rezervasyon formunu seçin
    const reservationForm = document.querySelector('#reservation-form');
    const startDateInput = document.querySelector('#start-date');
    const endDateInput = document.querySelector('#end-date');

    // Paket seçimini sağlayacak select elementini seçin
    const packageSelect = document.querySelector('#package');

    // Paketleri HTML'e ekle
    const packagesContainer = document.querySelector('.packages .box-container');

    packages.forEach(pkg => {
        // Paket kutusu oluşturma
        const packageBox = document.createElement('div');
        packageBox.classList.add('box');

        // Paket içeriğini oluşturma
        packageBox.innerHTML = `
            <h3>${pkg.packagename}</h3>
            <p>${pkg.details}</p>
            <span class="price">$${pkg.unitPrice}</span>
            <a href="#book" class="btn">Book Now</a>
        `;

        // Paket kutusunu container'a ekle
        packagesContainer.appendChild(packageBox);

        // Rezervasyon formu için paket seçenekleri ekleme
        const option = document.createElement('option');
        option.value = pkg.packageID;
        option.textContent = pkg.packagename;
        packageSelect.appendChild(option);
    });

    // Form gönderildiğinde işlemi ele alın
    reservationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        // Tarihleri kontrol et
        if (startDate >= endDate) {
            alert("Start date must be before end date.");
            return;
        }

        // Rezervasyon verisi oluştur
        const reservationData = {
            packageID: packageSelect.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
        };

        // Kullanıcıya uyarı mesajı göster
        alert("Rezervasyon oluşturuldu, ödeme sayfasına yönlendiriliyorsunuz.");

        // Rezervasyon verisiyle odeme.html sayfasına yönlendir
        window.location.href = `odeme.html?packageID=${reservationData.packageID}&startDate=${reservationData.startDate}&endDate=${reservationData.endDate}`;
    });
});
