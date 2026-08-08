import { FONT_SIZE } from '@/shared/constants/theme'; 
import React from 'react'; 
import { StyleSheet, Text, View, Share, TouchableOpacity } from 'react-native'; 
import Ionicons from '@expo/vector-icons/Ionicons';

// Добавляем описание типов для TypeScript
interface SharingProps {
  message?: string; // знак вопроса значит, что пропс необязательный
}

export default function Sharing({ message }: SharingProps) { 
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: message || 'Что-то пошло не так, если что, разработчик Макс :))))))',
      });
      if (result.action === Share.sharedAction) {
        console.log('Пользователь успешно поделился!');
      }
    } catch (error) {
      console.log('Ошибка:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onShare}>
        <Ionicons  style={styles.Img} name="share-social" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  shareBtnText: {
    fontSize: 22,
    color: 'white',
    padding: 2,
  },
  Img: {
    zIndex: 1,
    color: 'white'
  }
});
