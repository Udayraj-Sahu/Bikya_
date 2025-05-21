import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Document } from '@/types';
import Colors from '@/constants/Colors';
import { FileText, Check, X } from 'lucide-react-native';
import Button from './Button';

interface DocumentCardProps {
  document: Document;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPress?: (document: Document) => void;
}

export default function DocumentCard({
  document,
  showActions = false,
  onApprove,
  onReject,
  onPress,
}: DocumentCardProps) {
  const getStatusColor = () => {
    switch (document.status) {
      case 'approved':
        return Colors.light.success;
      case 'rejected':
        return Colors.light.danger;
      case 'pending':
      default:
        return Colors.light.warning;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(document)}
      activeOpacity={onPress ? 0.9 : 1}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FileText size={16} color={Colors.light.grey2} />
          <Text style={styles.title}>
            {document.type === 'idCard' ? 'ID Card' : 'Driving License'} ({document.side})
          </Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Text>
        </View>
      </View>

      <Image source={{ uri: document.uri }} style={styles.image} />

      <View style={styles.footer}>
        <Text style={styles.dateText}>Uploaded on {formatDate(document.createdAt)}</Text>

        {showActions && document.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <Button
              title="Approve"
              onPress={() => onApprove?.(document.id)}
              type="tertiary"
              icon={<Check size={16} color="white" />}
            />
            <View style={styles.buttonSpacer} />
            <Button
              title="Reject"
              onPress={() => onReject?.(document.id)}
              type="danger"
              icon={<X size={16} color="white" />}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.grey4,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonSpacer: {
    width: 12,
  },
});