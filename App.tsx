/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import RNFS from 'react-native-fs';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

const {width, height} = Dimensions.get('screen');

function formatBytes(a: number, b = 2) {
  if (!+a) {
    return '0 Bytes';
  }
  const c = b < 0 ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
    ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
  }`;
}

function App(): React.JSX.Element {
  const date = new Date();
  const pathJPG =
    'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?cs=srgb&dl=pexels-pixabay-460672.jpg';
  const pathPDF =
    'https://my.cumbria.ac.uk/media/MyCumbria/Documents/ebooksGuide.pdf';
  const pathXLSX =
    'https://api-ad1.omidev.my.id/storage/calculator/file-1717387463565.xlsx';
  const path = pathXLSX;
  const ext = path.split('.').pop();
  const fileName = `file_${Math.floor(
    date.getTime() + date.getSeconds() / 2,
  )}.${ext}`;
  const [progressPercentage, setProgressPercentage] = useState<string>('0%');
  const [progressSize, setProgressSize] = useState<string>('0 KB');
  const [totalSize, setTotalSize] = useState<string>('0 KB');

  const downloadFile = async () => {
    if (Platform.OS === 'ios') {
      actualDownload();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          actualDownload();
        } else {
          console.log('please grant permission');
        }
      } catch (err) {
        console.log('display error', err);
      }
    }
  };

  const actualDownload = () => {
    const {dirs} = RNFetchBlob.fs;
    const dirToSave =
      Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    const configfb = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: fileName,
        path: `${dirs.DownloadDir}/${fileName}`,
      },
      useDownloadManager: true,
      notification: true,
      mediaScannable: true,
      title: fileName,
      path: `${dirToSave}/${fileName}`,
    };
    const configOptions = Platform.select({
      ios: configfb,
      android: configfb,
    });

    RNFetchBlob.config(configOptions || {})
      .fetch('GET', path, {})
      // listen to download progress event, every 10%
      .progress((received, total) => {
        console.log('received', received);
        console.log('total', total);
        console.log('progress', received / total);
      })
      .then(res => {
        Alert.alert(
          'Download successful',
          'The file has been successfully downloaded.',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
        if (Platform.OS === 'ios') {
          RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
          RNFetchBlob.ios.previewDocument(configfb.path);
        }
        if (Platform.OS === 'android') {
          console.log('file downloaded');
        }
      })
      .catch(e => {
        console.log('invoice Download==>', e);
      });
  };

  // const actualDownload = () => {
  //   const directory =
  //     Platform.OS === 'ios'
  //       ? RNFS.DocumentDirectoryPath
  //       : RNFS.DownloadDirectoryPath;
  //   const filePath = directory + '/' + fileName;

  //   RNFS.downloadFile({
  //     fromUrl: path,
  //     toFile: filePath,
  //     background: true, // Enable downloading in the background (iOS only)
  //     discretionary: true, // Allow the OS to control the timing and speed (iOS only)
  //     begin: res => {
  //       console.log(res);
  //     },
  //     progress: res => {
  //       // Handle download progress updates if needed
  //       const progress = (res.bytesWritten / res.contentLength) * 100;
  //       setProgressSize(formatBytes(res.bytesWritten));
  //       setTotalSize(formatBytes(res.contentLength));
  //       setProgressPercentage(`${progress.toFixed(2)}%`);
  //     },
  //   })
  //     .promise.then(response => {
  //       setProgressSize(formatBytes(response.bytesWritten));
  //       setProgressPercentage('100%');

  //       // show alert success
  //       Alert.alert(
  //         'Download successful',
  //         'The file has been successfully downloaded.',
  //         [{text: 'OK', onPress: () => console.log('OK Pressed')}],
  //       );
  //     })
  //     .catch(err => {
  //       console.log('Download error:', err);
  //     });
  // };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{color: 'black', fontSize: 20, fontWeight: '600'}}>
        DOWNLOAD FILE
      </Text>
      <Image
        source={require('./assets/download-file-icon.png')}
        resizeMode="contain"
        style={styles.downloadIcon}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: width * 0.8,
        }}>
        <Text style={{color: 'black'}}>{progressSize}</Text>
        <Text style={{color: 'black'}}>{totalSize}</Text>
      </View>
      <View
        style={{
          width: width * 0.8,
          height: 20,
          backgroundColor: 'gray',
          borderRadius: 50,
        }}>
        <View
          style={{
            width: progressPercentage,
            height: 20,
            backgroundColor: 'blue',
            borderRadius: 50,
          }}
        />
      </View>
      <TouchableOpacity style={styles.downloadBtn} onPress={downloadFile}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>DOWNLOAD</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={downloadFile}>
        <Text style={{color: '#fff', fontWeight: 'bold'}}>DOWNLOAD</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  downloadIcon: {
    width: width * 0.7,
    height: height * 0.5,
  },
  downloadBtn: {
    width: width * 0.7,
    paddingVertical: 15,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    borderRadius: 20,
  },
});

export default App;
