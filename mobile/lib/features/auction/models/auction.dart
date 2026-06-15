class AuctionBid {
  final int id;
  final String bidderUsername;
  final double bidAmount;
  final String bidTime;

  AuctionBid({
    required this.id,
    required this.bidderUsername,
    required this.bidAmount,
    required this.bidTime,
  });

  factory AuctionBid.fromJson(Map<String, dynamic> json) {
    return AuctionBid(
      id: json['id'] != null 
          ? (json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0) 
          : 0,
      bidderUsername: json['bidderUsername'] ?? json['bidder_username'] ?? '',
      bidAmount: json['bidAmount'] != null 
          ? double.parse(json['bidAmount'].toString()) 
          : (json['amount'] != null ? double.parse(json['amount'].toString()) : 0.0),
      bidTime: json['bidTime'] ?? json['bid_time'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bidderUsername': bidderUsername,
      'bidAmount': bidAmount,
      'bidTime': bidTime,
    };
  }
}

class Auction {
  final int id;
  final String cardName;
  final String? imageUrl;
  final String? rarity;
  final String? condition;
  final double currentBid;
  final String? highestBidder;
  final int bidsCount;
  final String endTime;
  final String status;
  final bool createdByAdmin;
  final List<AuctionBid> bidHistory;

  Auction({
    required this.id,
    required this.cardName,
    this.imageUrl,
    this.rarity,
    this.condition,
    required this.currentBid,
    this.highestBidder,
    required this.bidsCount,
    required this.endTime,
    required this.status,
    required this.createdByAdmin,
    required this.bidHistory,
  });

  factory Auction.fromJson(Map<String, dynamic> json) {
    var bidsList = json['bidHistory'] as List? ?? json['bids_history'] as List? ?? [];
    List<AuctionBid> bids = bidsList.map((b) => AuctionBid.fromJson(b)).toList();

    return Auction(
      id: json['id'] != null 
          ? (json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0) 
          : 0,
      cardName: json['cardName'] ?? json['card_name'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image_url'],
      rarity: json['rarity'],
      condition: json['condition'] ?? json['card_condition'],
      currentBid: json['currentBid'] != null 
          ? double.parse(json['currentBid'].toString()) 
          : (json['current_bid'] != null ? double.parse(json['current_bid'].toString()) : 0.0),
      highestBidder: json['highestBidder'] ?? json['highest_bidder'],
      bidsCount: json['bidsCount'] != null 
          ? (json['bidsCount'] is int ? json['bidsCount'] : int.tryParse(json['bidsCount'].toString()) ?? 0) 
          : 0,
      endTime: json['endTime'] ?? json['end_time'] ?? '',
      status: json['status'] ?? 'ACTIVE',
      createdByAdmin: json['createdByAdmin'] ?? json['created_by_admin'] ?? false,
      bidHistory: bids,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cardName': cardName,
      'imageUrl': imageUrl,
      'rarity': rarity,
      'condition': condition,
      'currentBid': currentBid,
      'highestBidder': highestBidder,
      'bidsCount': bidsCount,
      'endTime': endTime,
      'status': status,
      'createdByAdmin': createdByAdmin,
      'bidHistory': bidHistory.map((b) => b.toJson()).toList(),
    };
  }

  bool get isActive => status.toUpperCase() == 'ACTIVE';
}
