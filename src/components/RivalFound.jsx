<div
  style={{
    maxWidth: 700,
    margin: "0 auto",
    marginTop: 120,
    textAlign: "center",
    color: "white",
  }}
>
  <motion.h1
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      fontSize: 40,
      fontWeight: 700,
      marginBottom: 40,
    }}
  >
    Rival encontrado
  </motion.h1>

  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.3 }}
    style={{
      marginBottom: 30,
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "#1d9bf0",
        margin: "0 auto 15px",
      }}
    />

    <div style={{ fontSize: 20, fontWeight: 600 }}>
      Rival
    </div>
  </motion.div>

  {/* TEMA */}
  <div style={{ marginBottom: 30 }}>
    <div style={{ color: "#aaa", marginBottom: 8 }}>
      Tema del debate
    </div>
    <div
      style={{
        fontSize: 22,
        fontWeight: 600,
        color: "#1d9bf0",
      }}
    >
      {topicId}
    </div>
  </div>

  {/* FRASE */}
  <div
    style={{
      background: "#111",
      border: "1px solid #2a2a2a",
      padding: 25,
      borderRadius: 18,
      marginBottom: 50,
      fontStyle: "italic",
      lineHeight: 1.6,
    }}
  >
    🔔 "{chosenIntro}"
  </div>

  {/* COUNTDOWN */}
  <motion.div
    key={count}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    style={{
      fontSize: 70,
      fontWeight: 800,
      color: "#1d9bf0",
    }}
  >
    {count}
  </motion.div>
</div>