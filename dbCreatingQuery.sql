USE meetingRoomBookingDB;
GO

-- Kullanýcýlar tablosu
CREATE TABLE Kullanici (
    KullaniciId INT PRIMARY KEY IDENTITY(1,1),
    AdSoyad NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    SifreHash NVARCHAR(255),
    KayitTarihi DATETIME DEFAULT GETDATE(),
    EmailOnayKodu UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    EmailOnaylandi BIT DEFAULT 0
);

-- Admin tablosu (her admin ayný zamanda kullanýcýdýr)
CREATE TABLE Admin (
    AdminId INT PRIMARY KEY,
    KullaniciId INT NOT NULL UNIQUE,
    KullaniciAdi NVARCHAR(50) NOT NULL,
    SifreHash NVARCHAR(255) NOT NULL,
    FOREIGN KEY (KullaniciId) REFERENCES Kullanici(KullaniciId)
);

-- Þifre sifirlama talepleri
CREATE TABLE SifreSifirlamaTalebi (
    SifreSifirlamaTalebiId INT PRIMARY KEY IDENTITY(1,1),
    KullaniciId INT NOT NULL,
    OlusturmaTarihi DATETIME DEFAULT GETDATE(),
    Token UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    Kullanildi BIT DEFAULT 0,
    FOREIGN KEY (KullaniciId) REFERENCES Kullanici(KullaniciId)
);

-- Kullanýcý giris loglarý
CREATE TABLE KullaniciGirisLog (
    KullaniciGirisLogId INT PRIMARY KEY IDENTITY(1,1),
    KullaniciId INT NOT NULL,
    GirisZamani DATETIME DEFAULT GETDATE(),
    BasariliMi BIT,
    FOREIGN KEY (KullaniciId) REFERENCES Kullanici(KullaniciId)
);
