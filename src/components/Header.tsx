import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';

interface HeaderProps {
  navigation: any;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ navigation, title }) => {
  return (
    <>
      <StatusBar backgroundColor="#6B7C1C" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerImageContainer}>
          <Image 
            source={require('../assets/character.png')} 
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
        {title && <Text style={styles.headerTitle}>{title}</Text>}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6B7C1C',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 15,
    top: 40,
    zIndex: 10,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: 50,
    height: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default Header; 