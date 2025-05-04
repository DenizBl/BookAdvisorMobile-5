

import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TextInput } from "react-native";

const BookDetail = ({ route }) => {
  const { book } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: book.image }} style={styles.image} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>

      {/* Kitap hakkında bilgi kısmı (örnek bilgi) */}
      <Text style={styles.description}>
        Bu kitap hakkında açıklama burada yer alacak. Özet, içerik veya okuyucuya sunulmak istenen bilgiler eklenebilir.
      </Text>

      {/* Yorum alanı */}
      <Text style={styles.commentTitle}>Yorum Yap</Text>
      <TextInput
        placeholder="Yorumunuzu buraya yazın..."
        style={styles.commentInput}
        multiline
      />
    </ScrollView>
  );
};

export default BookDetail;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  author: {
    fontSize: 18,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 30,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
  },
});
