

export default function ProfileCard({ title, value }) {
    
    return (
        <div className="profile-card">
            <p className="profile-card-title">{title}</p>
            <p className="profile-card-value">{value}</p>
        </div>
    );
}