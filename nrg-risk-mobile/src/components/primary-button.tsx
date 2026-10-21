import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
};

export default function PrimaryButton({ title, onPress, loading = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        opacity: pressed || loading ? 0.7 : 1,
      })}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{title}</Text>
      )}
    </Pressable>
  );
}