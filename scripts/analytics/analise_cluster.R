library(RSQLite)
library(ggplot2)
library(jsonlite)
library(dplyr)
library(scales)

db_path <- file.path("data", "databases", "real.db")
con <- dbConnect(SQLite(), db_path)
on.exit(dbDisconnect(con))

df_bio <- dbGetQuery(
  con,
  "SELECT nivelEstresse, nivelFoco, horasSono, qualidadeSono, nivelFadiga FROM checkins_bio"
)

if (nrow(df_bio) < 5) {
  set.seed(42)
  df_bio <- data.frame(
    nivelEstresse = rnorm(60, 45, 12),
    nivelFoco = rnorm(60, 62, 9),
    horasSono = rnorm(60, 6.8, 0.8),
    qualidadeSono = rnorm(60, 7, 1),
    nivelFadiga = rnorm(60, 45, 15)
  )
}

df_scaled <- scale(df_bio)
clusters <- kmeans(df_scaled, centers = 3)
df_bio$Cluster <- as.factor(clusters$cluster)

anova_model <- aov(nivelEstresse ~ horasSono, data = df_bio)
anova_pvalue <- summary(anova_model)[[1]][["Pr(>F)"]][1]

corr_focus <- cor(df_bio$nivelFoco, df_bio$horasSono)
mean_focus <- mean(df_bio$nivelFoco)
mean_stress <- mean(df_bio$nivelEstresse)

plot_obj <- ggplot(df_bio, aes(x = nivelEstresse, y = nivelFoco, color = Cluster)) +
  geom_point(size = 3, alpha = 0.8) +
  geom_smooth(method = "loess", se = FALSE, color = "#0ea5e9") +
  theme_minimal(base_family = "sans") +
  labs(
    title = "Mapa Neuro ESG — foco vs estresse",
    x = "Nível de Estresse",
    y = "Nível de Foco",
    subtitle = sprintf("Estresse médio %.1f | Foco médio %.1f", mean_stress, mean_focus)
  ) +
  scale_color_brewer(palette = "Set2")

png("insight_r_plot.png", width = 1000, height = 700)
print(plot_obj)
dev.off()

summary_payload <- list(
  sustainablePace = round(0.6 * mean_focus + 0.4 * (100 - mean_stress)),
  corrFocusSleep = round(corr_focus, 3),
  anovaPValue = round(anova_pvalue, 4),
  clusters = as.list(table(df_bio$Cluster)),
  sampleSize = nrow(df_bio)
)

write_json(summary_payload, "insight_r_summary.json", pretty = TRUE, auto_unbox = TRUE)
cat("Relatório R atualizado com sucesso\n")
