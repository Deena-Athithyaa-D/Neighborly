from django.db import models
import uuid

class User(models.Model):
    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)

class Profile(models.Model):
    
    uuid = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=50)
    age = models.IntegerField()
    pno = models.CharField(max_length=20)
    profession = models.CharField(max_length=50)
    user_code = models.CharField(max_length=50)
    
class Community(models.Model):
    
    comm_name = models.CharField(max_length = 50)
    admin_id = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=100)
    latitude = models.CharField(max_length=50)
    longtitude = models.CharField()

class JoinRequest(models.Model):
    
    admin_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="admin")
    member_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="member")
    comm_id = models.ForeignKey(Community, on_delete=models.CASCADE)
    accepted = models.IntegerField(default=1)
    

class Join(models.Model):
    
    comm_id = models.ForeignKey(Community, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    referral_code = models.CharField(max_length=50)
    is_admin = models.IntegerField(default=0)
    
class Posts(models.Model):
    
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    comm_id = models.ForeignKey(Community, on_delete=models.CASCADE)
    text_content = models.CharField(max_length=5000)
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)

class Offers(models.Model):
    
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    comm_id = models.ForeignKey(Community, on_delete=models.CASCADE)
    offer_type = models.CharField(max_length=30)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    
class Requests(models.Model):
    
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_request")
    comm_id = models.ForeignKey(Community, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=30)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    from_time = models.CharField(max_length=20,null=True,blank=True)
    to_time = models.CharField(max_length=20,null=True,blank=True)
    from_date = models.CharField(max_length=20,null=True,blank=True)
    to_date = models.CharField(max_length=20,null=True,blank=True)
    provider_id = models.ForeignKey(User, on_delete=models.CASCADE,null=True,blank=True, related_name="provider_request")