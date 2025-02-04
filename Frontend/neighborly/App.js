import { View, Text } from 'react-native';
import tw from 'tailwind-react-native-classnames';

export default function App() {
  return (
    <View style={tw`flex-1 justify-center items-center bg-blue-500`}>
      <Text style={tw`text-white text-lg font-bold`}>Hello, Tailwind in React Native!</Text>
    </View>
  );
}
