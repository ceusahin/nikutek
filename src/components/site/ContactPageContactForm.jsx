import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";

const ContactPageContactForm = () => {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axiosInstance.post("/contact/send", form);
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Form gönderilirken hata:", error);
      setError(language === "tr" ? "Mesajınız gönderilemedi. Lütfen tekrar deneyin." : "Your message could not be sent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <p className="text-[#343434] text-center mb-6">
          {language === "tr"
            ? "Aklınızdaki her türlü soru, görüş veya iş birliği talepleriniz için bizimle iletişime geçebilirsiniz. Size en kısa sürede geri dönüş sağlayacağız."
            : "You can contact us for any questions, opinions or collaboration requests. We will get back to you as soon as possible."}
        </p>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {language === "tr"
              ? "Mesajınız başarıyla gönderildi! En kısa sürede size geri dönüş yapacağız."
              : "Your message has been sent successfully! We will get back to you as soon as possible."}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label={language === "tr" ? "İsim" : "Name"}
            name="name"
            variant="filled"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="filled"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <TextField
            label={language === "tr" ? "Telefon Numarası" : "Phone Number"}
            name="phone"
            type="tel"
            variant="filled"
            value={form.phone}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <TextField
            label={language === "tr" ? "Konu" : "Subject"}
            name="subject"
            variant="filled"
            value={form.subject}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <TextField
            label={language === "tr" ? "Mesajınız" : "Your Message"}
            name="message"
            multiline
            rows={5}
            variant="filled"
            value={form.message}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading 
              ? (language === "tr" ? "Gönderiliyor..." : "Sending...") 
              : (language === "tr" ? "Gönder" : "Send")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContactPageContactForm;
