import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  CheckCheck,
  Calendar,
  BookOpen,
  Sparkles,
  CreditCard,
  Megaphone,
  CheckCircle,
} from 'lucide-react';
import { NotificationType } from '../../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen || !currentUser) return null;

  const userNotifications = notifications.filter((n) => n.destinataire_id === currentUser.id);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'presence':
        return <Calendar className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />;
      case 'devoir':
        return <BookOpen className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />;
      case 'appreciation':
        return <Sparkles className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />;
      case 'paiement':
        return <CreditCard className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />;
      case 'annonce':
        return <Megaphone className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />;
      default:
        return <CheckCircle className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md cloud-card border-4 border-white p-5 shadow-cloud-pop mt-12 sm:mr-4 max-h-[85vh] flex flex-col font-baloo">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#CDBDF2]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] shadow-sm">
              <Bell className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#1B2A7A] leading-tight">Notifications</h3>
              <p className="text-xs text-[#4A5487]">
                {userNotifications.filter((n) => !n.lu).length} non lues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userNotifications.some((n) => !n.lu) && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#1B2A7A] hover:underline font-bold flex items-center gap-1"
                title="Tout marquer comme lu"
              >
                <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Tout lire</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FFFFFF] hover:bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center border border-[#CDBDF2] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2.5 py-4 flex-1 pr-1">
          {userNotifications.length === 0 ? (
            <div className="text-center py-10 text-[#4A5487] text-sm">
              <p>Aucune notification pour le moment.</p>
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  notif.lu
                    ? 'bg-[#FFFFFF]/70 border-[#CDBDF2]/40 opacity-75'
                    : 'bg-[#FFFFFF] border-[#FFE15C] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF6E3] border border-[#CDBDF2] flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-extrabold truncate ${notif.lu ? 'text-[#1B2A7A]' : 'text-[#1B2A7A]'}`}>
                        {notif.titre}
                      </p>
                      <span className="text-[10px] text-[#4A5487] shrink-0 font-bold">
                        {new Date(notif.cree_le).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5487] mt-1 line-clamp-2 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
