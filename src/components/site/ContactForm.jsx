import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../../api/axiosInstance";
import useLanguage from "../../hooks/useLanguage";

function ContactForm() {
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

  const textFieldStyle = {
    "& .MuiFilledInput-root": {
      "&:before": { borderBottomColor: "#ccc" },
      "&:hover:not(.Mui-disabled):before": { borderBottomColor: "#e6d800" },
      "&:after": { borderBottomColor: "#e6d800" },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#000",
    },
    InputProps: { style: { backgroundColor: "#fff" } },
  };

  return (
    <section className="py-10 sm:py-16 px-2 sm:px-4">
      <div className="w-full max-w-2xl mx-auto">
        <Paper
          sx={{
            padding: { xs: 2, sm: 4 },
            boxShadow: "none",
            border: "none",
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            textAlign="center"
            fontWeight={700}
            color="black"
          >
            {language === "tr" ? "Bize Ulaşın" : "Contact Us"}
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            mb={3}
            sx={{ color: "#000000" }}
          >
            {language === "tr" 
              ? "Sorularınız, iş teklifleri veya iş birliği talepleriniz için bizimle iletişime geçebilirsiniz."
              : "You can contact us for any questions, business proposals or collaboration requests."}
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {language === "tr" ? "Mesajınız başarıyla gönderildi!" : "Your message has been sent successfully!"}
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
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* İsim / Mail */}
            <div className="flex flex-col md:flex-row gap-4">
              <TextField
                fullWidth
                label={language === "tr" ? "Adınız" : "Your Name"}
                name="name"
                variant="filled"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                sx={textFieldStyle}
              />
              <TextField
                fullWidth
                label={language === "tr" ? "E-posta" : "Email"}
                name="email"
                type="email"
                variant="filled"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                sx={textFieldStyle}
              />
            </div>

            {/* Telefon / Konu */}
            <div className="flex flex-col md:flex-row gap-4">
              <TextField
                fullWidth
                label={language === "tr" ? "Telefon" : "Phone"}
                name="phone"
                type="tel"
                variant="filled"
                value={form.phone}
                onChange={handleChange}
                required
                disabled={loading}
                sx={textFieldStyle}
              />
              <TextField
                fullWidth
                label={language === "tr" ? "Konu" : "Subject"}
                name="subject"
                variant="filled"
                value={form.subject}
                onChange={handleChange}
                required
                disabled={loading}
                sx={textFieldStyle}
              />
            </div>

            <TextField
              label={language === "tr" ? "Mesajınız" : "Your Message"}
              name="message"
              multiline
              rows={4}
              variant="filled"
              value={form.message}
              onChange={handleChange}
              required
              disabled={loading}
              sx={textFieldStyle}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                mt: 2,
                bgcolor: "#fdf001",
                color: "#000",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#e6d800",
                },
                "&:disabled": {
                  backgroundColor: "#f0f0f0",
                  color: "#999",
                },
              }}
            >
              {loading 
                ? (language === "tr" ? "Gönderiliyor..." : "Sending...") 
                : (language === "tr" ? "Gönder" : "Send")}
            </Button>
          </Box>
        </Paper>
      </div>
    </section>
  );
}

export default ContactForm;
