import React, { useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import { MultipleValuesAutocomplete } from "../../src/components/Forms/AutoComplete/MultipleValuesAutocomplete";
import BaseCard from "../../src/components/BaseCard/BaseCard";

const CreateProject = () => {
  const [projectData, setProjectData] = useState({
    projectName: "",
    projectDescription: "",
    applicationType: "",
    category: "",
    members: [],
    projectFile: null,
  });

  const applicationTypes = [
    { value: "turkiye", label: "Teknofest Türkiye" },
    { value: "kktc", label: "Teknofest KKTC" },
  ];

  const categories = {
    turkiye: [
      { value: "akilli_ulasim", label: "2025 Akıllı Ulaşım Yarışması" },
      { value: "biyoteknoloji", label: "2025 Biyoteknoloji İnovasyon Yarışması" },
      { value: "blokzincir", label: "2025 Blokzincir Yarışması" },
      { value: "cevre_enerji", label: "2025 Çevre ve Enerji Teknolojileri Yarışması" },
      { value: "cip_tasarim", label: "2025 Çip Tasarım Yarışması" },
      { value: "dikey_roket", label: "2025 Dikey İnişli Roket Yarışması" },
      { value: "egitim_teknolojileri", label: "2025 Eğitim Teknolojileri Yarışması" },
      { value: "engelsiz_yasam", label: "2025 Engelsiz Yaşam Teknolojileri Yarışması" },
      { value: "fintech", label: "2025 Finansal Teknolojiler Yarışması" },
      { value: "havacilik_ai", label: "2025 Havacılıkta Yapay Zeka Yarışması" },
      { value: "hava_savunma", label: "2025 Hava Savunma Sistemleri Yarışması" },
      { value: "helikopter", label: "2025 Helikopter Tasarım Yarışması" },
      { value: "hyperloop", label: "2025 Hyperloop Geliştirme Yarışması" },
      { value: "insanlik_yararina", label: "2025 İnsanlık Yararına Teknoloji Yarışması" },
      { value: "ida", label: "2025 İnsansız Deniz Aracı Yarışması" },
      { value: "iha", label: "2025 İnsansız Hava Aracı Yarışmaları" },
      { value: "ika", label: "2025 İnsansız Kara Aracı Yarışması" },
      { value: "jet_motor", label: "2025 Jet Motor Tasarım Yarışması" },
      { value: "kablosuz_haberlesme", label: "2025 Kablosuz Haberleşme Yarışması" },
      { value: "iklim_2204d", label: "2025 Lise Öğrencileri İklim Değişikliği Araştırma Projeleri Yarışması (2204-D)" },
      { value: "kutup_2204c", label: "2025 Lise Öğrencileri Kutup Araştırma Projeleri Yarışması (2204-C)" },
      { value: "model_uydu", label: "2025 Model Uydu Yarışması" },
      { value: "pardus", label: "2025 Pardus Hata Yakalama ve Öneri Yarışması" },
      { value: "psikoloji_tech", label: "2025 Psikolojide Teknolojik Uygulamalar Yarışması" },
      { value: "roket", label: "2025 Roket Yarışması" },
      { value: "savasan_iha", label: "2025 Savaşan İHA Yarışması" },
      { value: "suru_iha", label: "2025 Sürü İHA Yarışması" },
      { value: "tarim", label: "2025 Tarım Teknolojileri Yarışması" },
      { value: "robolig", label: "2025 TEKNOFEST Robolig Yarışması" },
      { value: "uni_2242", label: "2025 Üniversite Öğrencileri Araştırma Proje Yarışmaları (2242)" }
    ],
    kktc: [
      { value: "sosyal_inovasyon", label: "2025 Sosyal İnovasyon Yarışması" },
      { value: "drone", label: "2025 TEKNOFEST Drone Şampiyonası - KKTC" },
      { value: "araştırma_projesi", label: "2025 TEKNOFEST KKTC Araştırma Proje Yarışması" },
      { value: "robolig", label: "2025 TEKNOFEST Robolig Mavi Vatan Yarışması" },
      { value: "turizm", label: "2025 Turizm Teknolojileri Yarışması" },
      { value: "ucan_araba", label: "2025 Uçan Araba Simülasyon Yarışması" },
    
    ],
  };

  // Örnek üye listesi - Bu veriyi API'den çekebilirsiniz
  const memberOptions = [
    { id: 1, label: "Ahmet Yılmaz" },
    { id: 2, label: "Mehmet Demir" },
    { id: 3, label: "Ayşe Kaya" },
    { id: 4, label: "Fatma Şahin" },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    setProjectData((prev) => ({
      ...prev,
      projectFile: event.target.files[0],
    }));
  };

  const handleMemberChange = (event, newValue) => {
    setProjectData(prev => ({
      ...prev,
      members: newValue
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Proje verileri:", projectData);
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={12} lg={12}>
        <BaseCard title="Yeni Proje Oluştur">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proje Adı"
                  name="projectName"
                  value={projectData.projectName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Proje Açıklaması"
                  name="projectDescription"
                  value={projectData.projectDescription}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Başvuru Tipi"
                  name="applicationType"
                  value={projectData.applicationType}
                  onChange={handleChange}
                  required
                >
                  {applicationTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {projectData.applicationType && (
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Kategori"
                    name="category"
                    value={projectData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories[projectData.applicationType].map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12}>
                <MultipleValuesAutocomplete
                  options={memberOptions}
                  value={projectData.members}
                  onChange={handleMemberChange}
                  label="Proje Üyeleri"
                  placeholder="Üye eklemek için yazın..."
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                >
                  Proje PDF'i Yükle
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Projeyi Kaydet
                </Button>
              </Grid>
            </Grid>
          </form>
        </BaseCard>
      </Grid>
    </Grid>
  );
};

export default CreateProject; 