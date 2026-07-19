import { FONT_SIZE } from '@/shared/constants/theme'; 
import React from 'react'; 
import { StyleSheet, Text, View, Share, TouchableOpacity } from 'react-native'; 

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
        <Text style={styles.shareBtnText}>Поделиться</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 5,
  },
  shareBtnText: {
    fontSize: 17,
    color: 'white',
    padding: 2,
  }
});
